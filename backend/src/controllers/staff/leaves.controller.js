const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const listLeaves = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const employeeId =
    req.user.role === 'admin' || req.user.role === 'employee'
      ? req.query.employeeId
      : req.user.id;

  const leaves = await staffService.listLeaves({
    status: req.query.status,
    employeeId: employeeId ? Number(employeeId) : undefined,
    limit,
    offset
  });

  return success(res, { page, pageSize: limit, items: leaves });
});

const getLeave = asyncHandler(async (req, res) => {
  const leave = await staffService.getLeaveById(Number(req.params.id));
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  if (req.user.role !== 'admin' && leave.employee_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return success(res, leave);
});

const createLeave = asyncHandler(async (req, res) => {
  const employeeId = req.body.employee_id || req.user.id;
  const leave = await staffService.createLeave({ ...req.body, employee_id: employeeId });
  return created(res, leave);
});

const updateLeave = asyncHandler(async (req, res) => {
  const leave = await staffService.getLeaveById(Number(req.params.id));
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }
  if (req.user.role !== 'admin' && leave.employee_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const updated = await staffService.updateLeave(leave.id, req.body);
  return success(res, updated);
});

const approveLeave = asyncHandler(async (req, res) => {
  const leave = await staffService.getLeaveById(Number(req.params.id));
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const updated = await staffService.setLeaveStatus(leave.id, 'approved', req.user.id);
  return success(res, updated);
});

const rejectLeave = asyncHandler(async (req, res) => {
  const leave = await staffService.getLeaveById(Number(req.params.id));
  if (!leave) {
    return res.status(404).json({ error: 'Leave request not found' });
  }

  const updated = await staffService.setLeaveStatus(leave.id, 'rejected', req.user.id);
  return success(res, updated);
});

module.exports = {
  listLeaves,
  getLeave,
  createLeave,
  updateLeave,
  approveLeave,
  rejectLeave
};

