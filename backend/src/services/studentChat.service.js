const { query } = require('../db/pool');
const config = require('../config/env');

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'moonshotai/kimi-k2-thinking';

// Check if user is a guest
const isGuestUser = async (userId) => {
  const result = await query(
    `SELECT role FROM common_app.users WHERE id = $1`,
    [userId]
  );
  return result.rows[0]?.role === 'guest';
};

// Create a new chat session
const createChatSession = async (studentId, courseId = null) => {
  // For guests, course_id can be null
  const result = await query(
    `INSERT INTO student_app.student_chat_sessions (student_id, course_id, status)
     VALUES ($1, $2, 'active')
     RETURNING session_id, student_id, course_id, started_at, status`,
    [studentId, courseId]
  );
  return result.rows[0];
};

// Get chat session by ID
const getChatSession = async (sessionId, studentId) => {
  const result = await query(
    `SELECT session_id, student_id, course_id, started_at, ended_at, 
            message_count, total_tokens, summary, status
     FROM student_app.student_chat_sessions
     WHERE session_id = $1 AND student_id = $2`,
    [sessionId, studentId]
  );
  return result.rows[0] || null;
};

// List chat sessions for a student
const listChatSessions = async (studentId, { courseId, status, limit = 50, offset = 0 } = {}) => {
  const conditions = ['student_id = $1'];
  const values = [studentId];
  let idx = 2;

  if (courseId) {
    conditions.push(`course_id = $${idx++}`);
    values.push(courseId);
  }
  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const where = conditions.join(' AND ');

  const result = await query(
    `SELECT session_id, student_id, course_id, started_at, ended_at, 
            message_count, total_tokens, summary, status
     FROM student_app.student_chat_sessions
     WHERE ${where}
     ORDER BY started_at DESC
     LIMIT $${idx} OFFSET $${idx + 1}`,
    [...values, limit, offset]
  );
  return result.rows;
};

// Get conversation history for a session
const getConversationHistory = async (sessionId) => {
  const result = await query(
    `SELECT message_id, role, content, reasoning_details, message_order, created_at
     FROM student_app.student_chat_messages
     WHERE session_id = $1
     ORDER BY message_order ASC`,
    [sessionId]
  );
  return result.rows;
};

// Save a message to the database
const saveMessage = async (sessionId, role, content, reasoningDetails = null, messageOrder) => {
  const result = await query(
    `INSERT INTO student_app.student_chat_messages 
     (session_id, role, content, reasoning_details, message_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING message_id, role, content, reasoning_details, message_order, created_at`,
    [sessionId, role, content, reasoningDetails ? JSON.stringify(reasoningDetails) : null, messageOrder]
  );
  return result.rows[0];
};

// Update session message count and tokens
const updateSessionStats = async (sessionId, tokensUsed) => {
  await query(
    `UPDATE student_app.student_chat_sessions
     SET message_count = message_count + 1,
         total_tokens = total_tokens + $1
     WHERE session_id = $2`,
    [tokensUsed, sessionId]
  );
};

// Send message to OpenRouter API
const sendMessageToOpenRouter = async (messages) => {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.openRouterApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: messages,
      reasoning: { enabled: true }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error?.message || `OpenRouter API error: ${response.statusText}`);
  }

  const result = await response.json();
  return result.choices[0].message;
};

// Send message in a chat session
const sendMessage = async (sessionId, studentId, message) => {
  // Verify session belongs to student
  const session = await getChatSession(sessionId, studentId);
  if (!session) {
    throw new Error('Session not found');
  }
  if (session.status !== 'active') {
    throw new Error('Session is not active');
  }

  // Get conversation history
  const history = await getConversationHistory(sessionId);
  
  // Build messages array for API
  const messages = history.map(msg => {
    const apiMessage = {
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    };
    // Preserve reasoning_details for assistant messages
    if (msg.role === 'assistant' && msg.reasoning_details) {
      apiMessage.reasoning_details = typeof msg.reasoning_details === 'string' 
        ? JSON.parse(msg.reasoning_details) 
        : msg.reasoning_details;
    }
    return apiMessage;
  });

  // Add new user message
  messages.push({
    role: 'user',
    content: message
  });

  // Save user message to database
  const userMessage = await saveMessage(sessionId, 'user', message, null, messages.length - 1);

  // Send to OpenRouter API
  const assistantResponse = await sendMessageToOpenRouter(messages);

  // Save assistant response
  const assistantMessage = await saveMessage(
    sessionId,
    'assistant',
    assistantResponse.content,
    assistantResponse.reasoning_details || null,
    messages.length
  );

  // Update session stats (estimate tokens - OpenRouter doesn't always return usage)
  const estimatedTokens = Math.ceil((message.length + assistantResponse.content.length) / 4);
  await updateSessionStats(sessionId, estimatedTokens);

  // Save to student_requests table ONLY for non-guest users
  // Guest users' data is not stored for teacher analytics
  const userIsGuest = await isGuestUser(studentId);
  if (!userIsGuest && session.course_id) {
    await query(
      `INSERT INTO student_app.student_requests 
       (student_id, course_id, prompt, ai_response, reasoning_details, tokens_used)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        studentId,
        session.course_id,
        message,
        assistantResponse.content,
        assistantResponse.reasoning_details ? JSON.stringify(assistantResponse.reasoning_details) : null,
        estimatedTokens
      ]
    );
  }

  return {
    userMessage,
    assistantMessage
  };
};

// Summarize a chat session
const summarizeSession = async (sessionId, studentId) => {
  const session = await getChatSession(sessionId, studentId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Get conversation history
  const history = await getConversationHistory(sessionId);
  
  if (history.length === 0) {
    throw new Error('No messages to summarize');
  }

  // Build messages for summarization
  const conversationText = history.map(msg => {
    const role = msg.role === 'user' ? 'Student' : 'Assistant';
    return `${role}: ${msg.content}`;
  }).join('\n\n');

  const summaryPrompt = `Please provide a concise summary of this student-teacher conversation. Include:
1. Key topics discussed
2. Student's main questions or concerns
3. Level of understanding demonstrated by the student
4. Any areas where the student might need additional help

Conversation:
${conversationText}

Summary:`;

  try {
    const summaryResponse = await sendMessageToOpenRouter([
      {
        role: 'user',
        content: summaryPrompt
      }
    ]);

    const summary = summaryResponse.content;

    // Update session with summary
    await query(
      `UPDATE student_app.student_chat_sessions
       SET summary = $1, status = 'summarized'
       WHERE session_id = $2`,
      [summary, sessionId]
    );

    // Optionally delete individual messages to save space (keep summary)
    // Uncomment if you want to clean up:
    // await query(
    //   `DELETE FROM student_app.student_chat_messages WHERE session_id = $1`,
    //   [sessionId]
    // );

    return summary;
  } catch (error) {
    // If summarization fails, mark as completed but keep messages
    await query(
      `UPDATE student_app.student_chat_sessions
       SET status = 'completed'
       WHERE session_id = $1`,
      [sessionId]
    );
    throw error;
  }
};

// End a chat session
const endSession = async (sessionId, studentId) => {
  const session = await getChatSession(sessionId, studentId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Update session end time and status
  await query(
    `UPDATE student_app.student_chat_sessions
     SET ended_at = NOW(), status = 'completed'
     WHERE session_id = $1`,
    [sessionId]
  );

  // Auto-summarize if message count > 10 or tokens > 5000
  if (session.message_count > 10 || session.total_tokens > 5000) {
    try {
      await summarizeSession(sessionId, studentId);
    } catch (error) {
      console.error('Failed to summarize session:', error);
      // Continue even if summarization fails
    }
  }

  return { ...session, ended_at: new Date(), status: 'completed' };
};

module.exports = {
  createChatSession,
  getChatSession,
  listChatSessions,
  getConversationHistory,
  sendMessage,
  endSession,
  summarizeSession
};

