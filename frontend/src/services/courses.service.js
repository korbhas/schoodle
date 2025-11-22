import { apiClient } from '../lib/api';

/**
 * List all courses with optional filters
 * @param {Object} params - Query parameters (search, department, teacherId, page, pageSize)
 * @returns {Promise} API response with courses list
 */
export const listCourses = async (params = {}) => {
  const response = await apiClient.get('/courses', { params });
  return response.data;
};

/**
 * Get a single course by ID
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with course details
 */
export const getCourse = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}`);
  return response.data;
};

/**
 * List course materials
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with materials list
 */
export const listMaterials = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/materials`);
  return response.data;
};

/**
 * List course assignments
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with assignments list
 */
export const listAssignments = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/assignments`);
  return response.data;
};

/**
 * List course announcements
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with announcements list
 */
export const listAnnouncements = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/announcements`);
  return response.data;
};

// Management functions (Phase 2)

/**
 * Create a new course
 * @param {Object} data - Course data (code, name, syllabus, credits, teacher_id, department_id)
 * @returns {Promise} API response with created course
 */
export const createCourse = async (data) => {
  const response = await apiClient.post('/courses', data);
  return response.data;
};

/**
 * Update a course
 * @param {number} courseId - Course ID
 * @param {Object} data - Course data to update
 * @returns {Promise} API response with updated course
 */
export const updateCourse = async (courseId, data) => {
  const response = await apiClient.patch(`/courses/${courseId}`, data);
  return response.data;
};

/**
 * Delete a course
 * @param {number} courseId - Course ID
 * @returns {Promise} API response
 */
export const deleteCourse = async (courseId) => {
  const response = await apiClient.delete(`/courses/${courseId}`);
  return response.data;
};

/**
 * Add a material to a course
 * @param {number} courseId - Course ID
 * @param {Object} data - Material data (title, description, file_url, created_by, is_published)
 * @returns {Promise} API response with created material
 */
export const addMaterial = async (courseId, data) => {
  const response = await apiClient.post(`/courses/${courseId}/materials`, data);
  return response.data;
};

/**
 * Delete a material
 * @param {number} materialId - Material ID
 * @returns {Promise} API response
 */
export const deleteMaterial = async (materialId) => {
  const response = await apiClient.delete(`/courses/materials/${materialId}`);
  return response.data;
};

/**
 * Create an assignment
 * @param {number} courseId - Course ID
 * @param {Object} data - Assignment data (title, description, status, due_at, max_score, attachment_url)
 * @returns {Promise} API response with created assignment
 */
export const createAssignment = async (courseId, data) => {
  const response = await apiClient.post(`/courses/${courseId}/assignments`, data);
  return response.data;
};

/**
 * Update an assignment
 * @param {number} assignmentId - Assignment ID
 * @param {Object} data - Assignment data to update
 * @returns {Promise} API response with updated assignment
 */
export const updateAssignment = async (assignmentId, data) => {
  const response = await apiClient.patch(`/courses/assignments/${assignmentId}`, data);
  return response.data;
};

/**
 * Delete an assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise} API response
 */
export const deleteAssignment = async (assignmentId) => {
  const response = await apiClient.delete(`/courses/assignments/${assignmentId}`);
  return response.data;
};

/**
 * Create an announcement
 * @param {number} courseId - Course ID
 * @param {Object} data - Announcement data (title, body, creator_id, expires_at)
 * @returns {Promise} API response with created announcement
 */
export const createAnnouncement = async (courseId, data) => {
  const response = await apiClient.post(`/courses/${courseId}/announcements`, data);
  return response.data;
};

// Enrollments functions
/**
 * List course enrollments
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with enrollments list
 */
export const listEnrollments = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/enrollments`);
  return response.data;
};

/**
 * Add students to course
 * @param {number} courseId - Course ID
 * @param {Object} data - Enrollment data (student_ids: number[])
 * @returns {Promise} API response
 */
export const addEnrollments = async (courseId, data) => {
  const response = await apiClient.post(`/courses/${courseId}/enrollments`, data);
  return response.data;
};

/**
 * Remove student from course
 * @param {number} courseId - Course ID
 * @param {number} studentId - Student ID
 * @returns {Promise} API response
 */
export const removeEnrollment = async (courseId, studentId) => {
  const response = await apiClient.delete(`/courses/${courseId}/enrollments/${studentId}`);
  return response.data;
};

// Sessions functions
/**
 * List course sessions
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with sessions list
 */
export const listSessions = async (courseId) => {
  const response = await apiClient.get(`/courses/${courseId}/sessions`);
  return response.data;
};

/**
 * Create a session
 * @param {number} courseId - Course ID
 * @param {Object} data - Session data (starts_at, duration_min, topic, room_name, recording_url)
 * @returns {Promise} API response with created session
 */
export const createSession = async (courseId, data) => {
  const response = await apiClient.post(`/courses/${courseId}/sessions`, data);
  return response.data;
};

/**
 * Update a session
 * @param {number} sessionId - Session ID
 * @param {Object} data - Session data to update
 * @returns {Promise} API response with updated session
 */
export const updateSession = async (sessionId, data) => {
  const response = await apiClient.patch(`/courses/sessions/${sessionId}`, data);
  return response.data;
};

/**
 * Delete a session
 * @param {number} sessionId - Session ID
 * @returns {Promise} API response
 */
export const deleteSession = async (sessionId) => {
  const response = await apiClient.delete(`/courses/sessions/${sessionId}`);
  return response.data;
};

// Attendance functions
/**
 * List attendance for a session
 * @param {number} sessionId - Session ID
 * @returns {Promise} API response with attendance list
 */
export const listAttendance = async (sessionId) => {
  const response = await apiClient.get(`/courses/sessions/${sessionId}/attendance`);
  return response.data;
};

/**
 * Mark attendance for multiple students
 * @param {number} sessionId - Session ID
 * @param {Object} data - Attendance data (entries: Array<{student_id, status, method, confidence, notes}>)
 * @returns {Promise} API response
 */
export const markAttendance = async (sessionId, data) => {
  const response = await apiClient.post(`/courses/sessions/${sessionId}/attendance`, data);
  return response.data;
};

/**
 * Update attendance record
 * @param {number} attendanceId - Attendance ID
 * @param {Object} data - Attendance data to update (status, method, confidence, notes)
 * @returns {Promise} API response with updated attendance
 */
export const updateAttendance = async (attendanceId, data) => {
  const response = await apiClient.patch(`/courses/attendance/${attendanceId}`, data);
  return response.data;
};

// Submissions functions
/**
 * List submissions for an assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise} API response with submissions list
 */
export const listSubmissions = async (assignmentId) => {
  const response = await apiClient.get(`/courses/assignments/${assignmentId}/submissions`);
  return response.data;
};

/**
 * Grade a submission
 * @param {number} submissionId - Submission ID
 * @param {Object} data - Grading data (grade, feedback, status, graded_by)
 * @returns {Promise} API response with updated submission
 */
export const gradeSubmission = async (submissionId, data) => {
  const response = await apiClient.patch(`/courses/submissions/${submissionId}`, data);
  return response.data;
};

