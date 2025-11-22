const notificationService = require('../services/notification.service');
const { success, paginate } = require('../utils/response');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unread, channel } = req.query;
  const offset = (page - 1) * limit;
  const unreadFilter = unread !== undefined ? unread === 'true' : undefined;

  const notifications = await notificationService.listNotifications({
    userId: req.user.id,
    unread: unreadFilter,
    channel,
    limit: Number(limit),
    offset
  });

  const totalCount = await notificationService.getTotalCount({
    userId: req.user.id,
    unread: unreadFilter,
    channel
  });

  res.json(paginate(notifications, totalCount, page, limit));
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);
  res.json(success({ unread_count: count }));
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(id, req.user.id);
  if (!notification) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  res.json(success(notification));
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);
  res.json(success({ message: 'All notifications marked as read' }));
});

const createNotification = asyncHandler(async (req, res) => {
  const { user_ids: userIds, channel, title, body, payload } = req.body;

  if (userIds.length === 1) {
    const notification = await notificationService.createNotification({
      user_id: userIds[0],
      channel,
      title,
      body,
      payload
    });
    return res.status(201).json(success(notification));
  }

  const notifications = userIds.map((userId) => ({
    user_id: userId,
    channel,
    title,
    body,
    payload
  }));

  await notificationService.createBulkNotifications(notifications);
  res.status(201).json(success({ message: `Created ${notifications.length} notifications` }));
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.user.role === 'admin';
  await notificationService.deleteNotification(id, req.user.id, isAdmin);
  res.json(success({ message: 'Notification deleted' }));
});

const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await notificationService.getNotificationStats();
  res.json(success(stats));
});

module.exports = {
  listNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getNotificationStats
};

