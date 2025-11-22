const studentService = require('../../services/student.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, paginate } = require('../../utils/response');

const canAccess = (req, studentId) => {
  // Admins, teachers, and employees can access any student
  if (['admin', 'teacher', 'employee'].includes(req.user.role)) {
    return true;
  }
  
  // Students can only access their own data
  // Ensure both values are numbers for comparison
  const userId = Number(req.user?.id);
  const targetStudentId = Number(studentId);
  
  // If user is a student, they must match the studentId
  if (req.user.role === 'student') {
    return userId === targetStudentId && !isNaN(userId) && !isNaN(targetStudentId);
  }
  
  return false;
};

const getGrades = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const grades = await studentService.listGrades(studentId);
  return success(res, grades);
});

const bulkUpsertGrades = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  
  // Only admin and teacher can update grades (already enforced by route)
  if (!['admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const grades = await studentService.bulkUpsertGrades(studentId, req.body.records);
  return success(res, grades);
});

const updateGrade = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const courseId = Number(req.params.courseId);
  
  // Only admin and teacher can update grades (already enforced by route)
  if (!['admin', 'teacher'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const grades = await studentService.upsertGrade(studentId, courseId, req.body);
  return success(res, grades);
});

const getAttendance = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const summary = await studentService.getAttendanceSummary(studentId);
  return success(res, summary);
});

const listAlerts = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const alerts = await studentService.listAlerts(studentId);
  return success(res, { items: alerts });
});

const createAlert = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  
  // Only admin, teacher, and employee can create alerts (already enforced by route)
  if (!['admin', 'teacher', 'employee'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const alert = await studentService.createAlert(studentId, req.body);
  return success(res, alert);
});

const listAssignments = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const assignments = await studentService.listAssignments(studentId, { limit, offset });
  return success(res, { page, pageSize: limit, items: assignments });
});

const submitAssignment = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const result = await studentService.createSubmission({
    studentId,
    assignmentId: req.body.assignment_id,
    fileUrl: req.body.file_url
  });
  return success(res, result);
});

const getSubmission = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const submissionId = Number(req.params.submissionId);
  const submission = await studentService.getSubmission({ studentId, submissionId });
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  return success(res, submission);
});

module.exports = {
  getGrades,
  bulkUpsertGrades,
  updateGrade,
  getAttendance,
  listAlerts,
  createAlert,
  listAssignments,
  submitAssignment,
  getSubmission
};

