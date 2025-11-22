const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const marketService = require('../../services/market.service');

const listTransactions = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const transactions = await marketService.listTransactions({
    payerId: req.query.payerId,
    payeeId: req.query.payeeId,
    referenceType: req.query.referenceType,
    limit,
    offset
  });
  return success(res, { page: Number(req.query.page) || 1, pageSize: limit, items: transactions });
});

const recordTransaction = asyncHandler(async (req, res) => {
  const transaction = await marketService.recordTransaction(req.body);
  return created(res, transaction);
});

module.exports = {
  listTransactions,
  recordTransaction
};

