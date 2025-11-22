import { apiClient } from '../lib/api';

/**
 * Create a new chat session
 * @param {number} studentId - Student user ID
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with session data
 */
export const createSession = async (studentId, courseId) => {
  // Strict validation
  const numStudentId = Number(studentId);
  const numCourseId = Number(courseId);
  
  if (!studentId || isNaN(numStudentId) || numStudentId <= 0) {
    throw new Error(`Invalid studentId: ${studentId}. Must be a positive number.`);
  }
  if (!courseId || isNaN(numCourseId) || numCourseId <= 0) {
    throw new Error(`Invalid courseId: ${courseId}. Must be a positive number.`);
  }
  
  const url = `/students/${numStudentId}/chat/sessions`;
  const fullUrl = `${apiClient.defaults.baseURL}${url}`;
  console.log('Creating session:');
  console.log('  - studentId:', numStudentId, 'courseId:', numCourseId);
  console.log('  - URL path:', url);
  console.log('  - Full URL:', fullUrl);
  
  try {
    const response = await apiClient.post(url, {
      course_id: numCourseId
    });
    return response.data;
  } catch (error) {
    console.error('createSession API error:', error);
    console.error('  - Request URL:', error.config?.url || 'unknown');
    throw error;
  }
};

/**
 * Send a message in a chat session
 * @param {number} studentId - Student user ID
 * @param {number} sessionId - Session ID
 * @param {string} message - Message content
 * @returns {Promise} API response with user and assistant messages
 */
export const sendMessage = async (studentId, sessionId, message) => {
  const response = await apiClient.post(
    `/students/${studentId}/chat/sessions/${sessionId}/messages`,
    { message }
  );
  return response.data;
};

/**
 * Get conversation history for a session
 * @param {number} studentId - Student user ID
 * @param {number} sessionId - Session ID
 * @returns {Promise} API response with messages
 */
export const getSessionHistory = async (studentId, sessionId) => {
  const response = await apiClient.get(
    `/students/${studentId}/chat/sessions/${sessionId}/messages`
  );
  return response.data;
};

/**
 * Get chat session details
 * @param {number} studentId - Student user ID
 * @param {number} sessionId - Session ID
 * @returns {Promise} API response with session data
 */
export const getSession = async (studentId, sessionId) => {
  const response = await apiClient.get(
    `/students/${studentId}/chat/sessions/${sessionId}`
  );
  return response.data;
};

/**
 * List chat sessions for a student
 * @param {number} studentId - Student user ID
 * @param {Object} params - Query parameters (course_id, status, page, pageSize)
 * @returns {Promise} API response with sessions list
 */
export const listSessions = async (studentId, params = {}) => {
  // Strict validation before constructing URL
  const numStudentId = Number(studentId);
  if (!studentId || isNaN(numStudentId) || numStudentId <= 0) {
    const error = new Error(`Invalid studentId: ${studentId}. Must be a positive number.`);
    console.error('listSessions validation failed:', error.message);
    throw error;
  }
  
  // Construct URL with validated studentId
  const url = `/students/${numStudentId}/chat/sessions`;
  const fullUrl = `${apiClient.defaults.baseURL}${url}`;
  console.log('Listing sessions:');
  console.log('  - studentId:', numStudentId, '(type:', typeof numStudentId, ')');
  console.log('  - URL path:', url);
  console.log('  - Full URL:', fullUrl);
  console.log('  - Params:', params);
  
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('listSessions API error:', error);
    console.error('  - Request URL:', error.config?.url || 'unknown');
    console.error('  - Request method:', error.config?.method || 'unknown');
    throw error;
  }
};

/**
 * End a chat session
 * @param {number} studentId - Student user ID
 * @param {number} sessionId - Session ID
 * @returns {Promise} API response with ended session data
 */
export const endSession = async (studentId, sessionId) => {
  const response = await apiClient.post(
    `/students/${studentId}/chat/sessions/${sessionId}/end`
  );
  return response.data;
};

