const { Router } = require('express');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const messagesController = require('../controllers/community/messages.controller');
const announcementsController = require('../controllers/community/announcements.controller');
const clubsController = require('../controllers/community/clubs.controller');
const eventsController = require('../controllers/community/events.controller');
const forumController = require('../controllers/community/forum.controller');
const {
  messageListSchema,
  messageIdSchema,
  messageSendSchema,
  announcementCreateSchema,
  announcementUpdateSchema,
  announcementIdSchema,
  clubCreateSchema,
  clubUpdateSchema,
  clubIdSchema,
  clubMemberSchema,
  clubMemberIdSchema,
  eventListSchema,
  eventCreateSchema,
  eventUpdateSchema,
  eventIdSchema,
  participantSchema,
  participantIdSchema,
  threadListSchema,
  threadLockSchema,
  threadIdSchema,
  postListSchema,
  postIdSchema
} = require('../validators/community.schema');

const router = Router();

router.use(authenticate);

// Messaging
router.get(
  '/messages',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(messageListSchema),
  messagesController.listMessages
);
router.get(
  '/messages/:messageId',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(messageIdSchema),
  messagesController.getMessage
);
router.post(
  '/messages',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(messageSendSchema),
  messagesController.sendMessage
);
router.patch(
  '/messages/:messageId/read',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(messageIdSchema),
  messagesController.markRead
);

// Announcements
router.get(
  '/announcements',
  authorize('admin', 'teacher', 'employee', 'student'),
  announcementsController.listAnnouncements
);
router.post('/announcements', authorize('admin', 'teacher'), validate(announcementCreateSchema), announcementsController.createAnnouncement);
router.patch(
  '/announcements/:announcementId',
  authorize('admin', 'teacher'),
  validate(announcementUpdateSchema),
  announcementsController.updateAnnouncement
);
router.delete(
  '/announcements/:announcementId',
  authorize('admin', 'teacher'),
  validate(announcementIdSchema),
  announcementsController.deleteAnnouncement
);

// Clubs
router.get('/clubs', authorize('admin', 'teacher'), clubsController.listClubs);
router.post('/clubs', authorize('admin', 'teacher'), validate(clubCreateSchema), clubsController.createClub);
router.patch('/clubs/:clubId', authorize('admin', 'teacher'), validate(clubUpdateSchema), clubsController.updateClub);
router.delete('/clubs/:clubId', authorize('admin', 'teacher'), validate(clubIdSchema), clubsController.deleteClub);
router.get('/clubs/:clubId/members', authorize('admin', 'teacher'), validate(clubIdSchema), clubsController.listMembers);
router.post('/clubs/:clubId/members', authorize('admin', 'teacher'), validate(clubMemberSchema), clubsController.addMember);
router.delete(
  '/clubs/:clubId/members/:studentId',
  authorize('admin', 'teacher'),
  validate(clubMemberIdSchema),
  clubsController.removeMember
);

// Events
router.get('/events', authorize('admin', 'teacher', 'employee'), validate(eventListSchema), eventsController.listEvents);
router.post('/events', authorize('admin', 'teacher'), validate(eventCreateSchema), eventsController.createEvent);
router.patch('/events/:eventId', authorize('admin', 'teacher'), validate(eventUpdateSchema), eventsController.updateEvent);
router.delete('/events/:eventId', authorize('admin', 'teacher'), validate(eventIdSchema), eventsController.deleteEvent);
router.get(
  '/events/:eventId/participants',
  authorize('admin', 'teacher'),
  validate(eventIdSchema),
  eventsController.listParticipants
);
router.post(
  '/events/:eventId/participants',
  authorize('admin', 'teacher'),
  validate(participantSchema),
  eventsController.registerParticipant
);
router.delete(
  '/events/:eventId/participants/:userId',
  authorize('admin', 'teacher'),
  validate(participantIdSchema),
  eventsController.removeParticipant
);

// Forum moderation
router.get('/forum/threads', authorize('admin', 'teacher', 'employee'), validate(threadListSchema), forumController.listThreads);
router.patch('/forum/threads/:threadId/lock', authorize('admin', 'teacher'), validate(threadLockSchema), forumController.lockThread);
router.delete('/forum/threads/:threadId', authorize('admin', 'teacher'), validate(threadIdSchema), forumController.deleteThread);
router.get('/forum/posts', authorize('admin', 'teacher', 'employee'), validate(postListSchema), forumController.listPosts);
router.delete('/forum/posts/:postId', authorize('admin', 'teacher'), validate(postIdSchema), forumController.deletePost);

module.exports = router;

