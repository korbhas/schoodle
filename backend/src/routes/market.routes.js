const { Router } = require('express');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const mapController = require('../controllers/market/map.controller');
const listingsController = require('../controllers/market/listings.controller');
const bountiesController = require('../controllers/market/bounties.controller');
const transactionsController = require('../controllers/market/transactions.controller');
const {
  locationListSchema,
  locationCreateSchema,
  locationIdSchema,
  locationUpdateSchema,
  reviewCreateSchema,
  reviewIdSchema,
  listingListSchema,
  listingCreateSchema,
  listingIdSchema,
  listingUpdateSchema,
  bountyListSchema,
  bountyCreateSchema,
  bountyIdSchema,
  bountyAcceptSchema,
  bountyStatusSchema,
  transactionListSchema,
  transactionCreateSchema
} = require('../validators/market.schema');

const router = Router();

router.use(authenticate);

// Map locations
router.get('/locations', authorize('admin', 'teacher', 'employee', 'student'), validate(locationListSchema), mapController.listLocations);
router.post('/locations', authorize('admin'), validate(locationCreateSchema), mapController.createLocation);
router.patch('/locations/:locationId', authorize('admin'), validate(locationUpdateSchema), mapController.updateLocation);
router.delete('/locations/:locationId', authorize('admin'), validate(locationIdSchema), mapController.deleteLocation);
router.get('/locations/:locationId/reviews', authorize('admin', 'teacher', 'employee', 'student'), validate(locationIdSchema), mapController.listReviews);
router.post('/locations/:locationId/reviews', authorize('admin', 'teacher', 'employee', 'student'), validate(reviewCreateSchema), mapController.addReview);
router.delete('/reviews/:reviewId', authorize('admin'), validate(reviewIdSchema), mapController.deleteReview);

// Listings
router.get('/listings', authorize('admin', 'teacher', 'employee', 'student'), validate(listingListSchema), listingsController.listListings);
router.post('/listings', authorize('admin', 'teacher', 'employee', 'student'), validate(listingCreateSchema), listingsController.createListing);
router.patch('/listings/:listingId', authorize('admin', 'teacher', 'employee', 'student'), validate(listingUpdateSchema), listingsController.updateListing);
router.delete('/listings/:listingId', authorize('admin', 'teacher', 'employee'), validate(listingIdSchema), listingsController.deleteListing);

// Bounties
router.get('/bounties', authorize('admin', 'teacher', 'employee', 'student'), validate(bountyListSchema), bountiesController.listBounties);
router.post('/bounties', authorize('admin', 'teacher', 'employee', 'student'), validate(bountyCreateSchema), bountiesController.createBounty);
router.post('/bounties/:bountyId/accept', authorize('admin', 'teacher', 'employee', 'student'), validate(bountyAcceptSchema), bountiesController.acceptBounty);
router.patch('/bounties/:bountyId/status', authorize('admin', 'teacher', 'employee', 'student'), validate(bountyStatusSchema), bountiesController.updateBountyStatus);
router.delete('/bounties/:bountyId', authorize('admin', 'teacher', 'employee'), validate(bountyIdSchema), bountiesController.deleteBounty);

// Transactions
router.get('/transactions', authorize('admin', 'employee'), validate(transactionListSchema), transactionsController.listTransactions);
router.post('/transactions', authorize('admin', 'employee'), validate(transactionCreateSchema), transactionsController.recordTransaction);

module.exports = router;

