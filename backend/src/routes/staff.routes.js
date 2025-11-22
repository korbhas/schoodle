const { Router } = require('express');

const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');
const teachersController = require('../controllers/staff/teachers.controller');
const employeesController = require('../controllers/staff/employees.controller');
const departmentsController = require('../controllers/staff/departments.controller');
const payrollController = require('../controllers/staff/payroll.controller');
const leavesController = require('../controllers/staff/leaves.controller');
const feedbackController = require('../controllers/staff/feedback.controller');
const analyticsController = require('../controllers/staff/analytics.controller');
const {
  teachersListSchema,
  teacherIdSchema,
  teacherCreateSchema,
  teacherUpdateSchema,
  employeesListSchema,
  employeeIdSchema,
  employeeReportsSchema,
  employeeCreateSchema,
  employeeUpdateSchema,
  departmentCreateSchema,
  departmentUpdateSchema,
  departmentIdSchema,
  payrollListSchema,
  payrollCreateSchema,
  payrollUpdateSchema,
  payrollIdSchema,
  leaveListSchema,
  leaveCreateSchema,
  leaveUpdateSchema,
  leaveIdSchema,
  leaveActionSchema,
  feedbackListSchema,
  feedbackCreateSchema,
  feedbackIdSchema
} = require('../validators/staff.schema');

const router = Router();

router.use(authenticate);

// Teachers
router.get(
  '/teachers',
  authorize('admin', 'employee', 'teacher'),
  validate(teachersListSchema),
  teachersController.listTeachers
);
router.get('/teachers/:id', authorize('admin', 'employee', 'teacher'), validate(teacherIdSchema), teachersController.getTeacher);
router.post('/teachers', authorize('admin'), validate(teacherCreateSchema), teachersController.createTeacher);
router.patch(
  '/teachers/:id',
  authorize('admin'),
  validate(teacherUpdateSchema),
  teachersController.updateTeacher
);
router.delete('/teachers/:id', authorize('admin'), validate(teacherIdSchema), teachersController.deleteTeacher);

// Employees
router.get(
  '/employees',
  authorize('admin', 'employee'),
  validate(employeesListSchema),
  employeesController.listEmployees
);
router.get('/employees/:id', authorize('admin', 'employee'), validate(employeeIdSchema), employeesController.getEmployee);
router.post('/employees', authorize('admin'), validate(employeeCreateSchema), employeesController.createEmployee);
router.patch(
  '/employees/:id',
  authorize('admin'),
  validate(employeeUpdateSchema),
  employeesController.updateEmployee
);
router.delete('/employees/:id', authorize('admin'), validate(employeeIdSchema), employeesController.deleteEmployee);
router.get(
  '/employees/:id/reports',
  authorize('admin'),
  validate(employeeReportsSchema),
  employeesController.getReports
);

// Departments
router.get('/departments', authorize('admin', 'employee'), departmentsController.listDepartments);
router.post('/departments', authorize('admin'), validate(departmentCreateSchema), departmentsController.createDepartment);
router.patch(
  '/departments/:id',
  authorize('admin'),
  validate(departmentUpdateSchema),
  departmentsController.updateDepartment
);
router.delete(
  '/departments/:id',
  authorize('admin'),
  validate(departmentIdSchema),
  departmentsController.deleteDepartment
);

// Payroll
router.get('/payroll', authorize('admin'), validate(payrollListSchema), payrollController.listPayroll);
router.get('/payroll/:id', authorize('admin'), validate(payrollIdSchema), payrollController.getPayroll);
router.post('/payroll', authorize('admin'), validate(payrollCreateSchema), payrollController.createPayroll);
router.patch('/payroll/:id', authorize('admin'), validate(payrollUpdateSchema), payrollController.updatePayroll);
router.get('/payroll/:id/payslip', authorize('admin'), validate(payrollIdSchema), payrollController.getPayslip);

// Leave requests
router.get(
  '/leaves',
  authorize('admin', 'employee', 'teacher'),
  validate(leaveListSchema),
  leavesController.listLeaves
);
router.post(
  '/leaves',
  authorize('admin', 'employee', 'teacher'),
  validate(leaveCreateSchema),
  leavesController.createLeave
);
router.get('/leaves/:id', authorize('admin', 'employee', 'teacher'), validate(leaveIdSchema), leavesController.getLeave);
router.patch(
  '/leaves/:id',
  authorize('admin', 'employee', 'teacher'),
  validate(leaveUpdateSchema),
  leavesController.updateLeave
);
router.post('/leaves/:id/approve', authorize('admin'), validate(leaveActionSchema), leavesController.approveLeave);
router.post('/leaves/:id/reject', authorize('admin'), validate(leaveActionSchema), leavesController.rejectLeave);

// Feedback
router.get(
  '/feedback',
  authorize('admin', 'teacher'),
  validate(feedbackListSchema),
  feedbackController.listFeedback
);
router.post(
  '/feedback',
  authorize('admin', 'teacher'),
  validate(feedbackCreateSchema),
  feedbackController.createFeedback
);
router.delete(
  '/feedback/:id',
  authorize('admin', 'teacher'),
  validate(feedbackIdSchema),
  feedbackController.deleteFeedback
);

// Analytics
router.get(
  '/teachers/:id/analytics/courses',
  authorize('admin', 'teacher'),
  analyticsController.listTeacherCourses
);
router.get(
  '/teachers/:id/analytics/courses/:courseId',
  authorize('admin', 'teacher'),
  analyticsController.getCourseAnalytics
);
router.get(
  '/teachers/:id/analytics/students/:studentId',
  authorize('admin', 'teacher'),
  analyticsController.getStudentAnalytics
);

module.exports = router;

