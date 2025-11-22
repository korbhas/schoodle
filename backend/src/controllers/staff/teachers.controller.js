const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const listTeachers = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const data = await staffService.listTeachers({
    department: req.query.department,
    search: req.query.search,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: data });
});

const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await staffService.getTeacherById(Number(req.params.id));
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  return success(res, teacher);
});

const createTeacher = asyncHandler(async (req, res) => {
  const teacher = await staffService.createTeacher(req.body);
  return created(res, teacher);
});

const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await staffService.updateTeacher(Number(req.params.id), req.body);
  if (!teacher) {
    return res.status(404).json({ error: 'Teacher not found' });
  }
  return success(res, teacher);
});

const deleteTeacher = asyncHandler(async (req, res) => {
  await staffService.deleteTeacher(Number(req.params.id));
  return success(res, { message: 'Teacher removed' });
});

module.exports = {
  listTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher
};

