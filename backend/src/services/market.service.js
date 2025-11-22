const { query } = require('../db/pool');

// Map locations
const listLocations = async ({ category, search }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (category) {
    conditions.push(`category = $${idx++}`);
    values.push(category);
  }
  if (search) {
    conditions.push(`name ILIKE $${idx++}`);
    values.push(`%${search}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT id, name, description, category, latitude, longitude, created_by, created_at
     FROM common_app.map_locations
     ${where}
     ORDER BY name ASC`,
    values
  );
  return result.rows;
};

const createLocation = async ({ name, description, category, latitude, longitude, created_by: createdBy }) => {
  const result = await query(
    `INSERT INTO common_app.map_locations (name, description, category, latitude, longitude, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, description, category, latitude, longitude, createdBy]
  );
  return result.rows[0];
};

const updateLocation = async (id, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.map_locations WHERE id = $1', [id]);
    return existing.rows[0] || null;
  }

  values.push(id);
  const result = await query(
    `UPDATE common_app.map_locations SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteLocation = async (id) => {
  await query('DELETE FROM common_app.map_locations WHERE id = $1', [id]);
};

const listReviews = async (locationId) => {
  const result = await query(
    `SELECT lr.id, lr.rating, lr.comment, lr.user_id, lr.created_at, u.full_name
     FROM common_app.location_reviews lr
     JOIN common_app.users u ON u.id = lr.user_id
     WHERE lr.location_id = $1
     ORDER BY lr.created_at DESC`,
    [locationId]
  );
  return result.rows;
};

const addReview = async (locationId, userId, { rating, comment }) => {
  const result = await query(
    `INSERT INTO common_app.location_reviews (location_id, user_id, rating, comment)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (location_id, user_id) DO UPDATE
       SET rating = EXCLUDED.rating,
           comment = EXCLUDED.comment,
           created_at = NOW()
     RETURNING *`,
    [locationId, userId, rating, comment]
  );
  return result.rows[0];
};

const deleteReview = async (reviewId) => {
  await query('DELETE FROM common_app.location_reviews WHERE id = $1', [reviewId]);
};

// Marketplace listings
const listListings = async ({ status, sellerId, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }
  if (sellerId) {
    conditions.push(`seller_id = $${idx++}`);
    values.push(sellerId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT ml.*, u.full_name AS seller_name
     FROM common_app.market_listings ml
     JOIN common_app.users u ON u.id = ml.seller_id
     ${where}
     ORDER BY ml.created_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const createListing = async ({ seller_id: sellerId, title, description, price, photos }) => {
  const result = await query(
    `INSERT INTO common_app.market_listings (seller_id, title, description, price, photos)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sellerId, title, description, price, photos ?? []]
  );
  return result.rows[0];
};

const updateListing = async (listingId, payload) => {
  const fields = [];
  const values = [];
  let idx = 1;

  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = $${idx++}`);
    values.push(value);
  });

  if (!fields.length) {
    const existing = await query('SELECT * FROM common_app.market_listings WHERE id = $1', [listingId]);
    return existing.rows[0] || null;
  }

  values.push(listingId);
  const result = await query(
    `UPDATE common_app.market_listings SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] || null;
};

const deleteListing = async (listingId) => {
  await query('DELETE FROM common_app.market_listings WHERE id = $1', [listingId]);
};

// Bounties
const listBounties = async ({ status, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT b.*, poster.full_name AS poster_name, accepter.full_name AS accepter_name
     FROM common_app.bounties b
     JOIN common_app.users poster ON poster.id = b.poster_id
     LEFT JOIN common_app.users accepter ON accepter.id = b.accepter_id
     ${where}
     ORDER BY b.created_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const createBounty = async ({ poster_id: posterId, description, reward_amount: rewardAmount, location_pickup: pickup, location_drop: drop, due_at: dueAt }) => {
  const result = await query(
    `INSERT INTO common_app.bounties (poster_id, description, reward_amount, location_pickup, location_drop, due_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [posterId, description, rewardAmount, pickup, drop, dueAt]
  );
  return result.rows[0];
};

const acceptBounty = async (bountyId, accepterId) => {
  const result = await query(
    `UPDATE common_app.bounties
     SET accepter_id = $2, status = 'in_progress', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [bountyId, accepterId]
  );
  return result.rows[0] || null;
};

const updateBountyStatus = async (bountyId, status) => {
  const result = await query(
    `UPDATE common_app.bounties
     SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [bountyId, status]
  );
  return result.rows[0] || null;
};

const deleteBounty = async (bountyId) => {
  await query('DELETE FROM common_app.bounties WHERE id = $1', [bountyId]);
};

// Transactions
const listTransactions = async ({ payerId, payeeId, referenceType, limit, offset }) => {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (payerId) {
    conditions.push(`payer_id = $${idx++}`);
    values.push(payerId);
  }
  if (payeeId) {
    conditions.push(`payee_id = $${idx++}`);
    values.push(payeeId);
  }
  if (referenceType) {
    conditions.push(`reference_type = $${idx++}`);
    values.push(referenceType);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitPlaceholder = `$${idx++}`;
  const offsetPlaceholder = `$${idx}`;
  values.push(limit, offset);

  const result = await query(
    `SELECT t.*, payer.full_name AS payer_name, payee.full_name AS payee_name
     FROM common_app.transactions t
     JOIN common_app.users payer ON payer.id = t.payer_id
     JOIN common_app.users payee ON payee.id = t.payee_id
     ${where}
     ORDER BY t.processed_at DESC
     LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
    values
  );
  return result.rows;
};

const recordTransaction = async ({ payer_id: payerId, payee_id: payeeId, amount, reference_type: referenceType, reference_id: referenceId, notes }) => {
  const result = await query(
    `INSERT INTO common_app.transactions (payer_id, payee_id, amount, reference_type, reference_id, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [payerId, payeeId, amount, referenceType, referenceId ?? null, notes ?? null]
  );
  return result.rows[0];
};

module.exports = {
  listLocations,
  createLocation,
  updateLocation,
  deleteLocation,
  listReviews,
  addReview,
  deleteReview,
  listListings,
  createListing,
  updateListing,
  deleteListing,
  listBounties,
  createBounty,
  acceptBounty,
  updateBountyStatus,
  deleteBounty,
  listTransactions,
  recordTransaction
};

