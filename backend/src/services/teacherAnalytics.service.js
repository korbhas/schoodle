const { query } = require('../db/pool');
const config = require('../config/env');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-thinking';
const CACHE_DURATION_HOURS = 24; // Cache analytics for 24 hours

// Get cached analytics if available and not expired
const getCachedAnalytics = async (teacherId, courseId) => {
  const result = await query(
    `SELECT cache_id, analysis_data, generated_at, expires_at
     FROM staff_app.teacher_analytics_cache
     WHERE teacher_id = $1 AND course_id = $2 AND expires_at > NOW()
     ORDER BY generated_at DESC
     LIMIT 1`,
    [teacherId, courseId]
  );
  return result.rows[0] || null;
};

// Save analytics to cache
const saveAnalyticsCache = async (teacherId, courseId, analysisData) => {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + CACHE_DURATION_HOURS);

  await query(
    `INSERT INTO staff_app.teacher_analytics_cache 
     (teacher_id, course_id, analysis_data, expires_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING`,
    [teacherId, courseId, JSON.stringify(analysisData), expiresAt]
  );
};

// Get student requests for a course (with date range)
const getStudentRequestsForCourse = async (courseId, dateRange = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateRange);

  const result = await query(
    `SELECT sr.request_id, sr.student_id, sr.course_id, sr.prompt, sr.ai_response, 
            sr.reasoning_details, sr.tokens_used, sr.created_at,
            u.full_name as student_name, s.enrollment_no
     FROM student_app.student_requests sr
     JOIN student_app.students s ON s.user_id = sr.student_id
     JOIN common_app.users u ON u.id = sr.student_id
     WHERE sr.course_id = $1 AND sr.created_at >= $2
     ORDER BY sr.created_at DESC`,
    [courseId, cutoffDate]
  );
  return result.rows;
};

// Get session summaries for a course
const getSessionSummariesForCourse = async (courseId, dateRange = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - dateRange);

  const result = await query(
    `SELECT scs.session_id, scs.student_id, scs.course_id, scs.started_at, 
            scs.ended_at, scs.message_count, scs.total_tokens, scs.summary, scs.status,
            u.full_name as student_name, s.enrollment_no
     FROM student_app.student_chat_sessions scs
     JOIN student_app.students s ON s.user_id = scs.student_id
     JOIN common_app.users u ON u.id = scs.student_id
     WHERE scs.course_id = $1 AND scs.started_at >= $2
     ORDER BY scs.started_at DESC`,
    [courseId, cutoffDate]
  );
  return result.rows;
};

// Send analysis request to OpenRouter API
const analyzeWithOpenRouter = async (analysisPrompt) => {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      reasoning: { enabled: true }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message.content;
};

// Generate course analytics
const generateCourseAnalytics = async (teacherId, courseId) => {
  // Check cache first
  const cached = await getCachedAnalytics(teacherId, courseId);
  if (cached) {
    return {
      ...cached.analysis_data,
      cached: true,
      generated_at: cached.generated_at
    };
  }

  // Get course information
  const courseResult = await query(
    `SELECT id, code, name FROM common_app.courses WHERE id = $1`,
    [courseId]
  );
  const course = courseResult.rows[0];
  if (!course) {
    throw new Error('Course not found');
  }

  // Verify teacher teaches this course
  const teacherResult = await query(
    `SELECT user_id FROM common_app.courses WHERE id = $1 AND teacher_id = $2`,
    [courseId, teacherId]
  );
  if (teacherResult.rows.length === 0) {
    throw new Error('Unauthorized: You do not teach this course');
  }

  // Get session summaries (preferred) or individual requests
  const summaries = await getSessionSummariesForCourse(courseId, 30);
  const requests = await getStudentRequestsForCourse(courseId, 30);

  // Build analysis data
  let analysisData = '';
  
  if (summaries.length > 0) {
    // Use summaries if available
    const summariesText = summaries
      .filter(s => s.summary)
      .map(s => `Student: ${s.student_name} (${s.enrollment_no})\nSummary: ${s.summary}`)
      .join('\n\n---\n\n');
    
    analysisData = `Course: ${course.name} (${course.code})\n\nSession Summaries:\n${summariesText}`;
  } else if (requests.length > 0) {
    // Fallback to individual requests (limit to avoid token overflow)
    const limitedRequests = requests.slice(0, 50); // Limit to 50 most recent
    const requestsText = limitedRequests
      .map(r => `Student: ${r.student_name}\nQuestion: ${r.prompt}\nResponse: ${r.ai_response.substring(0, 200)}...`)
      .join('\n\n---\n\n');
    
    analysisData = `Course: ${course.name} (${course.code})\n\nStudent Questions and Responses:\n${requestsText}`;
  } else {
    // No data available
    return {
      strengths: [],
      weaknesses: [],
      common_topics: [],
      recommendations: ['No student interaction data available for this course yet.'],
      student_count: 0,
      total_interactions: 0,
      cached: false
    };
  }

  // Create analysis prompt
  const analysisPrompt = `As an educational analytics expert, analyze the following student interactions for the course "${course.name}" (${course.code}).

Based on the student questions, responses, and conversation summaries provided, identify:

1. **Student Strengths**: What topics or concepts are students understanding well?
2. **Student Weaknesses**: What areas are students struggling with?
3. **Common Topics**: What are the most frequently discussed topics?
4. **Recommendations**: What specific actions should the instructor take to improve student learning?

Provide your analysis in a structured format with clear sections.

Student Interaction Data:
${analysisData}`;

  try {
    const analysisResult = await analyzeWithOpenRouter(analysisPrompt);
    
    // Parse the analysis (basic parsing - could be improved)
    const analysis = {
      raw_analysis: analysisResult,
      strengths: extractSection(analysisResult, 'strengths', 'Strengths'),
      weaknesses: extractSection(analysisResult, 'weaknesses', 'Weaknesses'),
      common_topics: extractSection(analysisResult, 'common_topics', 'Common Topics'),
      recommendations: extractSection(analysisResult, 'recommendations', 'Recommendations'),
      student_count: new Set(requests.map(r => r.student_id)).size,
      total_interactions: requests.length + summaries.length,
      cached: false
    };

    // Cache the results
    await saveAnalyticsCache(teacherId, courseId, analysis);

    return analysis;
  } catch (error) {
    console.error('Error generating analytics:', error);
    throw new Error('Failed to generate analytics: ' + error.message);
  }
};

// Helper function to extract sections from AI response
const extractSection = (text, key, sectionName) => {
  const patterns = [
    new RegExp(`${sectionName}[\\s\\S]*?\\d+\\.\\s*([^\\n]+)`, 'gi'),
    new RegExp(`\\*\\*${sectionName}\\*\\*[\\s\\S]*?[-•]\\s*([^\\n]+)`, 'gi'),
    new RegExp(`${sectionName}:?[\\s\\S]*?([^\\n]+)`, 'gi')
  ];

  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches) {
      return matches.map(m => m.trim()).filter(Boolean);
    }
  }

  // Fallback: return empty array
  return [];
};

// Get list of courses for a teacher with analytics summary
const getTeacherCourses = async (teacherId) => {
  const result = await query(
    `SELECT c.id, c.code, c.name, c.created_at,
            COUNT(DISTINCT sr.student_id) as student_count,
            COUNT(sr.request_id) as total_requests,
            MAX(sr.created_at) as last_interaction
     FROM common_app.courses c
     LEFT JOIN student_app.student_requests sr ON sr.course_id = c.id
     WHERE c.teacher_id = $1
     GROUP BY c.id, c.code, c.name, c.created_at
     ORDER BY c.name`,
    [teacherId]
  );
  return result.rows;
};

// Get individual student analytics
const getStudentAnalytics = async (teacherId, studentId, courseId) => {
  // Verify teacher teaches this course
  const teacherResult = await query(
    `SELECT user_id FROM common_app.courses WHERE id = $1 AND teacher_id = $2`,
    [courseId, teacherId]
  );
  if (teacherResult.rows.length === 0) {
    throw new Error('Unauthorized: You do not teach this course');
  }

  // Get student's requests and sessions
  const requests = await query(
    `SELECT request_id, prompt, ai_response, created_at
     FROM student_app.student_requests
     WHERE student_id = $1 AND course_id = $2
     ORDER BY created_at DESC
     LIMIT 50`,
    [studentId, courseId]
  );

  const sessions = await query(
    `SELECT session_id, started_at, ended_at, message_count, summary, status
     FROM student_app.student_chat_sessions
     WHERE student_id = $1 AND course_id = $2
     ORDER BY started_at DESC
     LIMIT 20`,
    [studentId, courseId]
  );

  return {
    requests: requests.rows,
    sessions: sessions.rows,
    total_requests: requests.rows.length,
    total_sessions: sessions.rows.length
  };
};

module.exports = {
  generateCourseAnalytics,
  getCachedAnalytics,
  getTeacherCourses,
  getStudentAnalytics
};

