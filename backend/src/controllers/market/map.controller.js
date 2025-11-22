const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const marketService = require('../../services/market.service');

const listLocations = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const items = await marketService.listLocations({
    category: req.query.category,
    search: req.query.search,
    limit,
    offset
  });
  return success(res, { page: Number(req.query.page) || 1, pageSize: limit, items });
});

const createLocation = asyncHandler(async (req, res) => {
  const location = await marketService.createLocation(req.body);
  return created(res, location);
});

const updateLocation = asyncHandler(async (req, res) => {
  const location = await marketService.updateLocation(Number(req.params.locationId), req.body);
  if (!location) {
    return res.status(404).json({ error: 'Location not found' });
  }
  return success(res, location);
});

const deleteLocation = asyncHandler(async (req, res) => {
  await marketService.deleteLocation(Number(req.params.locationId));
  return success(res, { message: 'Location removed' });
});

const listReviews = asyncHandler(async (req, res) => {
  const reviews = await marketService.listReviews(Number(req.params.locationId));
  return success(res, { items: reviews });
});

const addReview = asyncHandler(async (req, res) => {
  const review = await marketService.addReview(Number(req.params.locationId), req.user.id, req.body);
  return created(res, review);
});

const deleteReview = asyncHandler(async (req, res) => {
  await marketService.deleteReview(Number(req.params.reviewId));
  return success(res, { message: 'Review deleted' });
});

module.exports = {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  listReviews,
  addReview,
  deleteReview
};

