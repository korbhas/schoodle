const { Router } = require('express');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const coursesController = require('../controllers/courses/courses.controller');
const sessionsController = require('../controllers/courses/sessions.controller');
const assignmentsController = require('../controllers/courses/assignments.controller');
const {
  courseListSchema,
  courseCreateSchema,
  courseUpdateSchema,
  courseIdOnlySchema,
  materialCreateSchema,
  materialIdParams,
  enrollmentCreateSchema,
  enrollmentDeleteSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  sessionIdSchema,
  attendanceBulkSchema,
  attendanceUpdateSchema,
  assignmentCreateSchema,
  assignmentUpdateSchema,
  assignmentIdSchema,
  submissionListSchema,
  submissionGradeSchema,
  announcementCreateSchema
} = require('../validators/course.schema');

const router = Router();

router.use(authenticate);

// Courses
router.get(
  '/',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(courseListSchema),
  coursesController.listCourses
);
router.post('/', authorize('admin'), validate(courseCreateSchema), coursesController.createCourse);
router.get('/:courseId', authorize('admin', 'teacher', 'employee', 'student'), validate(courseIdOnlySchema), coursesController.getCourse);
router.patch('/:courseId', authorize('admin', 'teacher'), validate(courseUpdateSchema), coursesController.updateCourse);
router.delete('/:courseId', authorize('admin'), validate(courseIdOnlySchema), coursesController.deleteCourse);

// Materials
router.get(
  '/:courseId/materials',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(courseIdOnlySchema),
  coursesController.listMaterials
);
router.post('/:courseId/materials', authorize('admin', 'teacher'), validate(materialCreateSchema), coursesController.addMaterial);
router.delete('/materials/:materialId', authorize('admin', 'teacher'), validate(materialIdParams), coursesController.deleteMaterial);

// Enrollments
router.get('/:courseId/enrollments', authorize('admin', 'teacher'), validate(courseIdOnlySchema), coursesController.listEnrollments);
router.post('/:courseId/enrollments', authorize('admin', 'teacher'), validate(enrollmentCreateSchema), coursesController.addEnrollments);
router.delete(
  '/:courseId/enrollments/:studentId',
  authorize('admin', 'teacher'),
  validate(enrollmentDeleteSchema),
  coursesController.removeEnrollment
);

// Sessions & attendance
router.get(
  '/:courseId/sessions',
  authorize('admin', 'teacher', 'employee'),
  validate(courseIdOnlySchema),
  sessionsController.listSessions
);
router.post('/:courseId/sessions', authorize('admin', 'teacher'), validate(sessionCreateSchema), sessionsController.createSession);
router.patch('/sessions/:sessionId', authorize('admin', 'teacher'), validate(sessionUpdateSchema), sessionsController.updateSession);
router.delete('/sessions/:sessionId', authorize('admin', 'teacher'), validate(sessionIdSchema), sessionsController.deleteSession);
router.get(
  '/sessions/:sessionId/attendance',
  authorize('admin', 'teacher', 'employee'),
  validate(sessionIdSchema),
  sessionsController.listAttendance
);
router.post(
  '/sessions/:sessionId/attendance',
  authorize('admin', 'teacher'),
  validate(attendanceBulkSchema),
  sessionsController.markAttendance
);
router.patch(
  '/attendance/:attendanceId',
  authorize('admin', 'teacher'),
  validate(attendanceUpdateSchema),
  sessionsController.updateAttendance
);

// Assignments & submissions
router.get(
  '/:courseId/assignments',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(courseIdOnlySchema),
  assignmentsController.listAssignments
);
router.post(
  '/:courseId/assignments',
  authorize('admin', 'teacher'),
  validate(assignmentCreateSchema),
  assignmentsController.createAssignment
);
router.patch(
  '/assignments/:assignmentId',
  authorize('admin', 'teacher'),
  validate(assignmentUpdateSchema),
  assignmentsController.updateAssignment
);
router.delete(
  '/assignments/:assignmentId',
  authorize('admin', 'teacher'),
  validate(assignmentIdSchema),
  assignmentsController.deleteAssignment
);
router.get(
  '/assignments/:assignmentId/submissions',
  authorize('admin', 'teacher'),
  validate(submissionListSchema),
  assignmentsController.listSubmissions
);
router.patch(
  '/submissions/:submissionId',
  authorize('admin', 'teacher'),
  validate(submissionGradeSchema),
  assignmentsController.gradeSubmission
);

// Announcements
router.get(
  '/:courseId/announcements',
  authorize('admin', 'teacher', 'employee', 'student'),
  validate(courseIdOnlySchema),
  coursesController.listAnnouncements
);
router.post(
  '/:courseId/announcements',
  authorize('admin', 'teacher'),
  validate(announcementCreateSchema),
  coursesController.createAnnouncement
);

module.exports = router;

