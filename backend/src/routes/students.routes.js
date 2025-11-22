const { Router } = require('express');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const profileController = require('../controllers/students/profile.controller');
const academicsController = require('../controllers/students/academics.controller');
const communityController = require('../controllers/students/community.controller');
const chatController = require('../controllers/students/chat.controller');
const {
  listStudentsSchema,
  createStudentSchema,
  updateStudentSchema,
  gradesBulkSchema,
  gradeUpdateSchema,
  attendanceSchema,
  alertsListSchema,
  alertCreateSchema,
  assignmentsListSchema,
  submissionCreateSchema,
  submissionDetailSchema,
  clubsListSchema,
  clubActionSchema,
  eventsListSchema,
  forumActivitySchema,
  digitalCardUpdateSchema,
  createChatSessionSchema,
  sendMessageSchema,
  chatSessionIdSchema,
  listChatSessionsSchema,
  endSessionSchema
} = require('../validators/student.schema');

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'teacher', 'employee'), validate(listStudentsSchema), profileController.listStudents);
router.post('/', authorize('admin'), validate(createStudentSchema), profileController.createStudent);

// Chat routes - must be before /:id route to avoid conflicts
router.post(
  '/:id/chat/sessions',
  (req, res, next) => {
    console.log('[Route] POST /:id/chat/sessions hit');
    console.log('[Route] req.params:', req.params);
    console.log('[Route] req.body:', req.body);
    next();
  },
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(createChatSessionSchema),
  chatController.createChatSession
);
router.get(
  '/:id/chat/sessions',
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(listChatSessionsSchema),
  chatController.listChatSessions
);
router.get(
  '/:id/chat/sessions/:sessionId',
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(chatSessionIdSchema),
  chatController.getChatSession
);
router.get(
  '/:id/chat/sessions/:sessionId/messages',
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(chatSessionIdSchema),
  chatController.getConversationHistory
);
router.post(
  '/:id/chat/sessions/:sessionId/messages',
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(sendMessageSchema),
  chatController.sendMessage
);
router.post(
  '/:id/chat/sessions/:sessionId/end',
  authorize('admin', 'teacher', 'employee', 'student', 'guest'),
  validate(endSessionSchema),
  chatController.endSession
);

router.get(
  '/:id',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(attendanceSchema),
  profileController.getStudent
);
router.patch(
  '/:id',
  authorize('admin', 'employee'),
  validate(updateStudentSchema),
  profileController.updateStudent
);
router.get(
  '/:id/digital-card',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(attendanceSchema),
  profileController.getDigitalCard
);
router.patch(
  '/:id/digital-card',
  authorize('admin', 'employee', 'student'),
  validate(digitalCardUpdateSchema),
  profileController.updateDigitalCard
);

router.get(
  '/:id/grades',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(attendanceSchema),
  academicsController.getGrades
);
router.post(
  '/:id/grades/bulk',
  authorize('admin', 'teacher'),
  validate(gradesBulkSchema),
  academicsController.bulkUpsertGrades
);
router.patch(
  '/:id/grades/:courseId',
  authorize('admin', 'teacher'),
  validate(gradeUpdateSchema),
  academicsController.updateGrade
);

router.get(
  '/:id/attendance',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(attendanceSchema),
  academicsController.getAttendance
);
router.get(
  '/:id/alerts',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(alertsListSchema),
  academicsController.listAlerts
);
router.post(
  '/:id/alerts',
  authorize('admin', 'teacher', 'employee'),
  validate(alertCreateSchema),
  academicsController.createAlert
);

router.get(
  '/:id/assignments',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(assignmentsListSchema),
  academicsController.listAssignments
);
router.post(
  '/:id/submissions',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(submissionCreateSchema),
  academicsController.submitAssignment
);
router.get(
  '/:id/submissions/:submissionId',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(submissionDetailSchema),
  academicsController.getSubmission
);

router.get(
  '/:id/clubs',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(clubsListSchema),
  communityController.listClubs
);
router.post(
  '/:id/clubs/:clubId/join',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(clubActionSchema),
  communityController.joinClub
);
router.delete(
  '/:id/clubs/:clubId/leave',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(clubActionSchema),
  communityController.leaveClub
);

router.get(
  '/:id/events',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(eventsListSchema),
  communityController.listEvents
);
router.get(
  '/:id/forum/activity',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(forumActivitySchema),
  communityController.forumActivity
);

module.exports = router;

