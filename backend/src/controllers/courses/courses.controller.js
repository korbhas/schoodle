const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const courseService = require('../../services/course.service');

const listCourses = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const courses = await courseService.listCourses({
    department: req.query.department,
    teacherId: req.query.teacherId,
    search: req.query.search,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: courses });
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(Number(req.params.courseId));
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  return success(res, course);
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  return created(res, course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(Number(req.params.courseId), req.body);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  return success(res, course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  await courseService.deleteCourse(Number(req.params.courseId));
  return success(res, { message: 'Course deleted' });
});

const listMaterials = asyncHandler(async (req, res) => {
  const materials = await courseService.listMaterials(Number(req.params.courseId));
  return success(res, { items: materials });
});

const addMaterial = asyncHandler(async (req, res) => {
  const material = await courseService.addMaterial(Number(req.params.courseId), req.body);
  return created(res, material);
});

const deleteMaterial = asyncHandler(async (req, res) => {
  await courseService.removeMaterial(Number(req.params.materialId));
  return success(res, { message: 'Material removed' });
});

const listEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await courseService.listEnrollments(Number(req.params.courseId));
  return success(res, { items: enrollments });
});

const addEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await courseService.enrollStudents(Number(req.params.courseId), req.body.student_ids);
  return success(res, { items: enrollments });
});

const removeEnrollment = asyncHandler(async (req, res) => {
  const enrollments = await courseService.removeEnrollment(
    Number(req.params.courseId),
    Number(req.params.studentId)
  );
  return success(res, { items: enrollments });
});

const listAnnouncements = asyncHandler(async (req, res) => {
  const items = await courseService.listAnnouncementsForCourse(Number(req.params.courseId));
  return success(res, { items });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await courseService.createAnnouncement(Number(req.params.courseId), req.body);
  return created(res, announcement);
});

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  listMaterials,
  addMaterial,
  deleteMaterial,
  listEnrollments,
  addEnrollments,
  removeEnrollment,
  listAnnouncements,
  createAnnouncement
};

