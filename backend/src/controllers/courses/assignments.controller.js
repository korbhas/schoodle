const asyncHandler = require('../../utils/asyncHandler');
const { success, created } = require('../../utils/response');
const courseService = require('../../services/course.service');

const listAssignments = asyncHandler(async (req, res) => {
  const assignments = await courseService.listAssignmentsForCourse(Number(req.params.courseId));
  return success(res, { items: assignments });
});

const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await courseService.createAssignment(Number(req.params.courseId), req.body);
  return created(res, assignment);
});

const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await courseService.updateAssignment(Number(req.params.assignmentId), req.body);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found' });
  }
  return success(res, assignment);
});

const deleteAssignment = asyncHandler(async (req, res) => {
  await courseService.deleteAssignment(Number(req.params.assignmentId));
  return success(res, { message: 'Assignment removed' });
});

const listSubmissions = asyncHandler(async (req, res) => {
  const submissions = await courseService.listSubmissionsForAssignment(Number(req.params.assignmentId));
  return success(res, { items: submissions });
});

const gradeSubmission = asyncHandler(async (req, res) => {
  const submission = await courseService.gradeSubmission(Number(req.params.submissionId), req.body);
  if (!submission) {
    return res.status(404).json({ error: 'Submission not found' });
  }
  return success(res, submission);
});

module.exports = {
  listAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  listSubmissions,
  gradeSubmission
};

