const studentService = require('../../services/student.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const canAccessStudent = (req, studentId) => {
  // Admins, teachers, and employees can access any student
  if (['admin', 'teacher', 'employee'].includes(req.user.role)) {
    return true;
  }
  
  // Students can only access their own data
  // Ensure both values are numbers for comparison
  const userId = Number(req.user?.id);
  const targetStudentId = Number(studentId);
  
  // If user is a student, they must match the studentId
  if (req.user.role === 'student') {
    return userId === targetStudentId && !isNaN(userId) && !isNaN(targetStudentId);
  }
  
  return false;
};

const listStudents = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;

  const students = await studentService.listStudents({
    year: req.query.year,
    program: req.query.program,
    advisorId: req.query.advisorId,
    limit,
    offset
  });

  return success(res, { page, pageSize: limit, items: students });
});

const getStudent = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);

  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const profile = await studentService.getStudentProfile(studentId);
  if (!profile) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return success(res, profile);
});

const createStudent = asyncHandler(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  return created(res, student);
});

const updateStudent = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  
  // Only admin and employee can update (already enforced by route, but adding check for clarity)
  if (!['admin', 'employee'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const student = await studentService.updateStudent(studentId, req.body);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }
  return success(res, student);
});

const getDigitalCard = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const card = await studentService.getDigitalCard(studentId);
  return success(res, { digital_card: card });
});

const updateDigitalCard = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const card = await studentService.updateDigitalCard(studentId, req.body.digital_card);
  return success(res, { digital_card: card });
});

module.exports = {
  listStudents,
  getStudent,
  createStudent,
  updateStudent,
  getDigitalCard,
  updateDigitalCard
};

