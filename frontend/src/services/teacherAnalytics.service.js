import { apiClient } from '../lib/api';

/**
 * Get course analytics for a teacher
 * @param {number} teacherId - Teacher user ID
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with analytics data
 */
export const getCourseAnalytics = async (teacherId, courseId) => {
  const response = await apiClient.get(`/staff/teachers/${teacherId}/analytics/courses/${courseId}`);
  return response.data;
};

/**
 * List all courses for a teacher with analytics summary
 * @param {number} teacherId - Teacher user ID
 * @returns {Promise} API response with courses list
 */
export const listTeacherCourses = async (teacherId) => {
  const response = await apiClient.get(`/staff/teachers/${teacherId}/analytics/courses`);
  return response.data;
};

/**
 * Get individual student analytics
 * @param {number} teacherId - Teacher user ID
 * @param {number} studentId - Student user ID
 * @param {number} courseId - Course ID
 * @returns {Promise} API response with student analytics
 */
export const getStudentAnalytics = async (teacherId, studentId, courseId) => {
  const response = await apiClient.get(
    `/staff/teachers/${teacherId}/analytics/students/${studentId}`,
    { params: { course_id: courseId } }
  );
  return response.data;
};

