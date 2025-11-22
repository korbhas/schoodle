const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const listEmployees = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const data = await staffService.listEmployees({
    department: req.query.department,
    search: req.query.search,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: data });
});

const getEmployee = asyncHandler(async (req, res) => {
  const employee = await staffService.getEmployeeById(Number(req.params.id));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return success(res, employee);
});

const createEmployee = asyncHandler(async (req, res) => {
  const employee = await staffService.createEmployee(req.body);
  return created(res, employee);
});

const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await staffService.updateEmployee(Number(req.params.id), req.body);
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }
  return success(res, employee);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  await staffService.deleteEmployee(Number(req.params.id));
  return success(res, { message: 'Employee removed' });
});

const getReports = asyncHandler(async (req, res) => {
  const reports = await staffService.getEmployeeReports(Number(req.params.id));
  return success(res, { items: reports });
});

module.exports = {
  listEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getReports
};

