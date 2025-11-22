const asyncHandler = require('../../utils/asyncHandler');
const { success, created } = require('../../utils/response');
const courseService = require('../../services/course.service');

const listSessions = asyncHandler(async (req, res) => {
  const sessions = await courseService.listSessions(Number(req.params.courseId));
  return success(res, { items: sessions });
});

const createSession = asyncHandler(async (req, res) => {
  const session = await courseService.createSession(Number(req.params.courseId), req.body);
  return created(res, session);
});

const updateSession = asyncHandler(async (req, res) => {
  const session = await courseService.updateSession(Number(req.params.sessionId), req.body);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return success(res, session);
});

const deleteSession = asyncHandler(async (req, res) => {
  await courseService.deleteSession(Number(req.params.sessionId));
  return success(res, { message: 'Session removed' });
});

const listAttendance = asyncHandler(async (req, res) => {
  const attendance = await courseService.listAttendanceForSession(Number(req.params.sessionId));
  return success(res, { items: attendance });
});

const markAttendance = asyncHandler(async (req, res) => {
  const attendance = await courseService.markAttendance(Number(req.params.sessionId), req.body.entries);
  return success(res, { items: attendance });
});

const updateAttendance = asyncHandler(async (req, res) => {
  const entry = await courseService.updateAttendanceEntry(Number(req.params.attendanceId), req.body);
  if (!entry) {
    return res.status(404).json({ error: 'Attendance entry not found' });
  }
  return success(res, entry);
});

module.exports = {
  listSessions,
  createSession,
  updateSession,
  deleteSession,
  listAttendance,
  markAttendance,
  updateAttendance
};

