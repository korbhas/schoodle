const staffService = require('../../services/staff.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const listPayroll = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const records = await staffService.listPayroll({
    month: req.query.month,
    department: req.query.department,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: records });
});

const getPayroll = asyncHandler(async (req, res) => {
  const record = await staffService.getPayrollById(Number(req.params.id));
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }
  return success(res, record);
});

const createPayroll = asyncHandler(async (req, res) => {
  const record = await staffService.createPayroll(req.body);
  return created(res, record);
});

const updatePayroll = asyncHandler(async (req, res) => {
  const record = await staffService.updatePayroll(Number(req.params.id), req.body);
  if (!record) {
    return res.status(404).json({ error: 'Payroll record not found' });
  }
  return success(res, record);
});

const getPayslip = asyncHandler(async (req, res) => {
  const record = await staffService.getPayrollById(Number(req.params.id));
  if (!record || !record.payslip_url) {
    return res.status(404).json({ error: 'Payslip not available' });
  }
  return success(res, { payslip_url: record.payslip_url });
});

module.exports = {
  listPayroll,
  getPayroll,
  createPayroll,
  updatePayroll,
  getPayslip
};

