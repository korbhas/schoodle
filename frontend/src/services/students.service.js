import { apiClient } from '../lib/api';

/**
 * List all students (admin/teacher/employee only)
 * @param {Object} params - Query parameters (year, program, advisorId, page, pageSize)
 * @returns {Promise} API response with students list
 */
export const listStudents = async (params = {}) => {
  const response = await apiClient.get('/students', { params });
  return response.data;
};

/**
 * Get a single student profile by ID
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with student profile
 */
export const getStudent = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}`);
  return response.data;
};

/**
 * Create a new student (admin only)
 * @param {Object} data - Student data
 * @returns {Promise} API response with created student
 */
export const createStudent = async (data) => {
  const response = await apiClient.post('/students', data);
  return response.data;
};

/**
 * Update a student profile (admin/employee only)
 * @param {number} studentId - Student user ID
 * @param {Object} data - Updated student data
 * @returns {Promise} API response with updated student
 */
export const updateStudent = async (studentId, data) => {
  const response = await apiClient.patch(`/students/${studentId}`, data);
  return response.data;
};

/**
 * Get student's digital card
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with digital card
 */
export const getDigitalCard = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/digital-card`);
  return response.data;
};

/**
 * Update student's digital card
 * @param {number} studentId - Student user ID
 * @param {Object} digitalCard - Digital card data
 * @returns {Promise} API response with updated digital card
 */
export const updateDigitalCard = async (studentId, digitalCard) => {
  const response = await apiClient.patch(`/students/${studentId}/digital-card`, {
    digital_card: digitalCard
  });
  return response.data;
};

/**
 * Get student's grades
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with grades and summary
 */
export const getGrades = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/grades`);
  return response.data;
};

/**
 * Bulk upsert grades for a student (admin/teacher only)
 * @param {number} studentId - Student user ID
 * @param {Array} records - Array of grade records
 * @returns {Promise} API response with updated grades
 */
export const bulkUpsertGrades = async (studentId, records) => {
  const response = await apiClient.post(`/students/${studentId}/grades/bulk`, {
    records
  });
  return response.data;
};

/**
 * Update a single grade for a student (admin/teacher only)
 * @param {number} studentId - Student user ID
 * @param {number} courseId - Course ID
 * @param {Object} data - Grade data (grade, gpa_points)
 * @returns {Promise} API response with updated grades
 */
export const updateGrade = async (studentId, courseId, data) => {
  const response = await apiClient.patch(`/students/${studentId}/grades/${courseId}`, data);
  return response.data;
};

/**
 * Get student's attendance summary
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with attendance summary
 */
export const getAttendance = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/attendance`);
  return response.data;
};

/**
 * List student's alerts
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with alerts list
 */
export const listAlerts = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/alerts`);
  return response.data;
};

/**
 * Create an alert for a student (admin/teacher/employee only)
 * @param {number} studentId - Student user ID
 * @param {Object} data - Alert data (course_id, reason, delivery)
 * @returns {Promise} API response with created alert
 */
export const createAlert = async (studentId, data) => {
  const response = await apiClient.post(`/students/${studentId}/alerts`, data);
  return response.data;
};

/**
 * List student's assignments
 * @param {number} studentId - Student user ID
 * @param {Object} params - Query parameters (page, pageSize)
 * @returns {Promise} API response with assignments list
 */
export const listAssignments = async (studentId, params = {}) => {
  const response = await apiClient.get(`/students/${studentId}/assignments`, { params });
  return response.data;
};

/**
 * Submit an assignment
 * @param {number} studentId - Student user ID
 * @param {Object} data - Submission data (assignment_id, file_url)
 * @returns {Promise} API response with submission
 */
export const submitAssignment = async (studentId, data) => {
  const response = await apiClient.post(`/students/${studentId}/submissions`, data);
  return response.data;
};

/**
 * Get a submission detail
 * @param {number} studentId - Student user ID
 * @param {number} submissionId - Submission ID
 * @returns {Promise} API response with submission details
 */
export const getSubmission = async (studentId, submissionId) => {
  const response = await apiClient.get(`/students/${studentId}/submissions/${submissionId}`);
  return response.data;
};

/**
 * List student's clubs
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with clubs list
 */
export const listClubs = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/clubs`);
  return response.data;
};

/**
 * Join a club
 * @param {number} studentId - Student user ID
 * @param {number} clubId - Club ID
 * @returns {Promise} API response with updated clubs list
 */
export const joinClub = async (studentId, clubId) => {
  const response = await apiClient.post(`/students/${studentId}/clubs/${clubId}/join`);
  return response.data;
};

/**
 * Leave a club
 * @param {number} studentId - Student user ID
 * @param {number} clubId - Club ID
 * @returns {Promise} API response with updated clubs list
 */
export const leaveClub = async (studentId, clubId) => {
  const response = await apiClient.delete(`/students/${studentId}/clubs/${clubId}/leave`);
  return response.data;
};

/**
 * List student's events
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with events list
 */
export const listEvents = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/events`);
  return response.data;
};

/**
 * Get student's forum activity
 * @param {number} studentId - Student user ID
 * @returns {Promise} API response with forum activity (threads and posts)
 */
export const getForumActivity = async (studentId) => {
  const response = await apiClient.get(`/students/${studentId}/forum/activity`);
  return response.data;
};

