const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const marketService = require('../../services/market.service');

const listListings = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const items = await marketService.listListings({
    status: req.query.status,
    sellerId: req.query.sellerId,
    limit,
    offset
  });
  return success(res, { page: Number(req.query.page) || 1, pageSize: limit, items });
});

const createListing = asyncHandler(async (req, res) => {
  const listing = await marketService.createListing(req.body);
  return created(res, listing);
});

const updateListing = asyncHandler(async (req, res) => {
  const listing = await marketService.updateListing(Number(req.params.listingId), req.body);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  return success(res, listing);
});

const deleteListing = asyncHandler(async (req, res) => {
  await marketService.deleteListing(Number(req.params.listingId));
  return success(res, { message: 'Listing removed' });
});

module.exports = {
  listListings,
  createListing,
  updateListing,
  deleteListing
};

