const success = (res, data = {}, status = 200) => res.status(status).json({ success: true, data });

const created = (res, data = {}) => success(res, data, 201);

const paginate = ({ page = 1, pageSize = 25 }) => {
  const limit = Math.min(Math.max(Number(pageSize) || 25, 1), 100);
  const offset = (Math.max(Number(page) || 1, 1) - 1) * limit;
  return { limit, offset };
};

module.exports = {
  success,
  created,
  paginate
};

