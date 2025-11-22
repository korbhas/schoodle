const studentService = require('../../services/student.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success } = require('../../utils/response');

const canAccess = (req, studentId) => {
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

const listClubs = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const clubs = await studentService.listClubs(studentId);
  return success(res, { items: clubs });
});

const joinClub = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const clubs = await studentService.joinClub(studentId, Number(req.params.clubId));
  return success(res, { items: clubs });
});

const leaveClub = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const clubs = await studentService.leaveClub(studentId, Number(req.params.clubId));
  return success(res, { items: clubs });
});

const listEvents = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const events = await studentService.listEvents(studentId);
  return success(res, { items: events });
});

const forumActivity = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  if (!canAccess(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const activity = await studentService.listForumActivity(studentId);
  return success(res, activity);
});

module.exports = {
  listClubs,
  joinClub,
  leaveClub,
  listEvents,
  forumActivity
};

