const { query } = require('../db/pool');

const listNotifications = async ({ userId, unread, channel, limit, offset }) => {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (unread !== undefined) {
    conditions.push(`read_at IS ${unread ? 'NULL' : 'NOT NULL'}`);
  }
  if (channel) {
    conditions.push(`channel = $${idx++}`);
    values.push(channel);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  values.push(limit, offset);
  const result = await query(
    `SELECT id, channel, title, body, payload, sent_at, read_at
     FROM common_app.notifications
     ${where}
     ORDER BY sent_at DESC
     LIMIT $${idx++} OFFSET $${idx}`,
    values
  );
  return result.rows;
};

const getUnreadCount = async (userId) => {
  const result = await query(
    'SELECT COUNT(*) as count FROM common_app.notifications WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
  return Number(result.rows[0].count);
};

const getTotalCount = async ({ userId, unread, channel }) => {
  const conditions = ['user_id = $1'];
  const values = [userId];
  let idx = 2;

  if (unread !== undefined) {
    conditions.push(`read_at IS ${unread ? 'NULL' : 'NOT NULL'}`);
  }
  if (channel) {
    conditions.push(`channel = $${idx++}`);
    values.push(channel);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query(
    `SELECT COUNT(*) as count FROM common_app.notifications ${where}`,
    values
  );
  return Number(result.rows[0].count);
};

const markAsRead = async (notificationId, userId) => {
  await query(
    'UPDATE common_app.notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );
  return getNotificationById(notificationId, userId);
};

const markAllAsRead = async (userId) => {
  await query(
    'UPDATE common_app.notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL',
    [userId]
  );
};

const getNotificationById = async (notificationId, userId) => {
  const result = await query(
    'SELECT * FROM common_app.notifications WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  );
  return result.rows[0] || null;
};

const createNotification = async ({ user_id: userId, channel, title, body, payload }) => {
  const result = await query(
    `INSERT INTO common_app.notifications (user_id, channel, title, body, payload)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [userId, channel, title, body, payload || null]
  );
  return result.rows[0];
};

const createBulkNotifications = async (notifications) => {
  const values = [];
  const placeholders = [];
  let idx = 1;

  notifications.forEach(({ user_id: userId, channel, title, body, payload }) => {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(userId, channel, title, body, payload || null);
  });

  await query(
    `INSERT INTO common_app.notifications (user_id, channel, title, body, payload)
     VALUES ${placeholders.join(', ')}`,
    values
  );
};

const deleteNotification = async (notificationId, userId, isAdmin) => {
  const condition = isAdmin ? 'id = $1' : 'id = $1 AND user_id = $2';
  const values = isAdmin ? [notificationId] : [notificationId, userId];
  await query(`DELETE FROM common_app.notifications WHERE ${condition}`, values);
};

const getNotificationStats = async () => {
  const total = await query('SELECT COUNT(*) as count FROM common_app.notifications');
  const read = await query('SELECT COUNT(*) as count FROM common_app.notifications WHERE read_at IS NOT NULL');
  const byChannel = await query(
    `SELECT channel, COUNT(*) as count
     FROM common_app.notifications
     GROUP BY channel`
  );

  return {
    total: Number(total.rows[0].count),
    read: Number(read.rows[0].count),
    unread: Number(total.rows[0].count) - Number(read.rows[0].count),
    byChannel: byChannel.rows.map((row) => ({ channel: row.channel, count: Number(row.count) }))
  };
};

module.exports = {
  listNotifications,
  getUnreadCount,
  getTotalCount,
  markAsRead,
  markAllAsRead,
  getNotificationById,
  createNotification,
  createBulkNotifications,
  deleteNotification,
  getNotificationStats
};

