const Joi = require('joi');

const wrapper = (body = Joi.object({}), params = Joi.object({}), query = Joi.object({})) =>
  Joi.object({ body, params, query });

const pagination = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  pageSize: Joi.number().integer().min(1).max(100).default(25)
});

// Locations
const locationListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    category: Joi.string(),
    search: Joi.string()
  })
);

const locationCreateSchema = wrapper(
  Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('', null),
    category: Joi.string().required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
    created_by: Joi.number().integer().required()
  })
);

const locationIdSchema = wrapper(Joi.object({}), Joi.object({ locationId: Joi.number().integer().required() }));

const locationUpdateSchema = wrapper(
  Joi.object({
    name: Joi.string(),
    description: Joi.string().allow('', null),
    category: Joi.string(),
    latitude: Joi.number(),
    longitude: Joi.number()
  }).min(1),
  Joi.object({ locationId: Joi.number().integer().required() })
);

const reviewCreateSchema = wrapper(
  Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().allow('', null)
  }),
  Joi.object({ locationId: Joi.number().integer().required() })
);

const reviewIdSchema = wrapper(Joi.object({}), Joi.object({ reviewId: Joi.number().integer().required() }));

// Listings
const listingListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    status: Joi.string(),
    sellerId: Joi.number().integer()
  })
);

const listingCreateSchema = wrapper(
  Joi.object({
    seller_id: Joi.number().integer().required(),
    title: Joi.string().required(),
    description: Joi.string().allow('', null),
    price: Joi.number().positive().required(),
    photos: Joi.array().items(Joi.string().uri())
  })
);

const listingIdSchema = wrapper(Joi.object({}), Joi.object({ listingId: Joi.number().integer().required() }));

const listingUpdateSchema = wrapper(
  Joi.object({
    title: Joi.string(),
    description: Joi.string().allow('', null),
    price: Joi.number().positive(),
    photos: Joi.array().items(Joi.string().uri()),
    status: Joi.string().valid('available', 'reserved', 'sold')
  }).min(1),
  Joi.object({ listingId: Joi.number().integer().required() })
);

// Bounties
const bountyListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    status: Joi.string()
  })
);

const bountyCreateSchema = wrapper(
  Joi.object({
    poster_id: Joi.number().integer().required(),
    description: Joi.string().required(),
    reward_amount: Joi.number().positive().required(),
    location_pickup: Joi.string().allow('', null),
    location_drop: Joi.string().allow('', null),
    due_at: Joi.date().allow(null)
  })
);

const bountyIdSchema = wrapper(Joi.object({}), Joi.object({ bountyId: Joi.number().integer().required() }));

const bountyAcceptSchema = wrapper(Joi.object({}), Joi.object({ bountyId: Joi.number().integer().required() }));

const bountyStatusSchema = wrapper(
  Joi.object({
    status: Joi.string().valid('completed', 'cancelled').required()
  }),
  Joi.object({ bountyId: Joi.number().integer().required() })
);

// Transactions
const transactionListSchema = wrapper(
  Joi.object({}),
  Joi.object({}),
  pagination.keys({
    payerId: Joi.number().integer(),
    payeeId: Joi.number().integer(),
    referenceType: Joi.string()
  })
);

const transactionCreateSchema = wrapper(
  Joi.object({
    payer_id: Joi.number().integer().required(),
    payee_id: Joi.number().integer().required(),
    amount: Joi.number().positive().required(),
    reference_type: Joi.string().required(),
    reference_id: Joi.number().integer().allow(null),
    notes: Joi.string().allow('', null)
  })
);

module.exports = {
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
};

