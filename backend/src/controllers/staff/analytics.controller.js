const teacherAnalyticsService = require('../../services/teacherAnalytics.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');

// Get course analytics
const getCourseAnalytics = asyncHandler(async (req, res) => {
  const teacherId = Number(req.user.id);
  const courseId = Number(req.params.courseId);

  // Verify user is a teacher
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers and admins can access analytics' });
  }

  const analytics = await teacherAnalyticsService.generateCourseAnalytics(teacherId, courseId);
  return success(res, analytics);
});

// List courses for teacher with analytics summary
const listTeacherCourses = asyncHandler(async (req, res) => {
  const teacherId = Number(req.params.id || req.user.id);

  // Verify user is accessing their own data or is admin
  if (req.user.role !== 'admin' && Number(req.user.id) !== teacherId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const courses = await teacherAnalyticsService.getTeacherCourses(teacherId);
  return success(res, { items: courses });
});

// Get individual student analytics
const getStudentAnalytics = asyncHandler(async (req, res) => {
  const teacherId = Number(req.user.id);
  const studentId = Number(req.params.studentId);
  const courseId = Number(req.query.course_id || req.params.courseId);

  // Verify user is a teacher
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers and admins can access analytics' });
  }

  if (!courseId) {
    return res.status(400).json({ error: 'course_id is required' });
  }

  const analytics = await teacherAnalyticsService.getStudentAnalytics(teacherId, studentId, courseId);
  return success(res, analytics);
});

module.exports = {
  getCourseAnalytics,
  listTeacherCourses,
  getStudentAnalytics
};

