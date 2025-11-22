const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const listFeedback = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;

  const feedback = await staffService.listFeedback({
    studentId: req.query.studentId,
    courseId: req.query.courseId,
    teacherId: req.query.teacherId,
    limit,
    offset
  });

  return success(res, { page, pageSize: limit, items: feedback });
});

const createFeedback = asyncHandler(async (req, res) => {
  const teacherId = req.body.teacher_id || req.user.id;
  const record = await staffService.createFeedback({ ...req.body, teacher_id: teacherId });
  return created(res, record);
});

const deleteFeedback = asyncHandler(async (req, res) => {
  await staffService.deleteFeedback(Number(req.params.id));
  return success(res, { message: 'Feedback removed' });
});

module.exports = {
  listFeedback,
  createFeedback,
  deleteFeedback
};

