const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const marketService = require('../../services/market.service');

const listBounties = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const bounties = await marketService.listBounties({
    status: req.query.status,
    limit,
    offset
  });
  return success(res, { page: Number(req.query.page) || 1, pageSize: limit, items: bounties });
});

const createBounty = asyncHandler(async (req, res) => {
  const bounty = await marketService.createBounty(req.body);
  return created(res, bounty);
});

const acceptBounty = asyncHandler(async (req, res) => {
  const bounty = await marketService.acceptBounty(Number(req.params.bountyId), req.user.id);
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  return success(res, bounty);
});

const updateBountyStatus = asyncHandler(async (req, res) => {
  const bounty = await marketService.updateBountyStatus(Number(req.params.bountyId), req.body.status);
  if (!bounty) {
    return res.status(404).json({ error: 'Bounty not found' });
  }
  return success(res, bounty);
});

const deleteBounty = asyncHandler(async (req, res) => {
  await marketService.deleteBounty(Number(req.params.bountyId));
  return success(res, { message: 'Bounty removed' });
});

module.exports = {
  listBounties,
  createBounty,
  acceptBounty,
  updateBountyStatus,
  deleteBounty
};

