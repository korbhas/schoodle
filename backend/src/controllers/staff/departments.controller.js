const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created } = require('../../utils/response');

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await staffService.listDepartments();
  return success(res, { items: departments });
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await staffService.createDepartment(req.body);
  return created(res, department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await staffService.updateDepartment(Number(req.params.id), req.body);
  if (!department) {
    return res.status(404).json({ error: 'Department not found' });
  }
  return success(res, department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  await staffService.deleteDepartment(Number(req.params.id));
  return success(res, { message: 'Department removed' });
});

module.exports = {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
};

