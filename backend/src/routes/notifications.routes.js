const { Router } = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const notificationsController = require('../controllers/notifications.controller');
const {
  notificationListSchema,
  notificationIdSchema,
  notificationCreateSchema
} = require('../validators/notification.schema');

const router = Router();
router.use(authenticate);

router.get('/', validate(notificationListSchema), notificationsController.listNotifications);
router.get('/unread-count', notificationsController.getUnreadCount);
router.patch('/:id/read', validate(notificationIdSchema), notificationsController.markAsRead);
router.patch('/read-all', notificationsController.markAllAsRead);
router.post('/', authorize('admin'), validate(notificationCreateSchema), notificationsController.createNotification);
router.delete('/:id', validate(notificationIdSchema), notificationsController.deleteNotification);
router.get('/stats', authorize('admin'), notificationsController.getNotificationStats);

module.exports = router;

