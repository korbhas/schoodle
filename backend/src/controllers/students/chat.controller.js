const studentChatService = require('../../services/studentChat.service');
const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');

const canAccessStudent = (req, studentId) => {
  if (['admin', 'teacher', 'employee'].includes(req.user.role)) {
    return true;
  }
  const userId = Number(req.user?.id);
  const targetStudentId = Number(studentId);
  if (req.user.role === 'student' || req.user.role === 'guest') {
    return userId === targetStudentId && !isNaN(userId) && !isNaN(targetStudentId);
  }
  return false;
};

// Create new chat session
const createChatSession = asyncHandler(async (req, res) => {
  console.log('[Chat Controller] createChatSession called');
  console.log('[Chat Controller] req.params:', req.params);
  console.log('[Chat Controller] req.body:', req.body);
  console.log('[Chat Controller] req.path:', req.path);
  console.log('[Chat Controller] req.url:', req.url);
  
  const studentId = Number(req.params.id);
  console.log('[Chat Controller] studentId:', studentId);
  
  if (!canAccessStudent(req, studentId)) {
    console.log('[Chat Controller] Access denied');
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { course_id: courseId } = req.body;
  
  // For guest users, course_id is optional (they can chat without a course)
  // For regular students, course_id is required
  if (req.user.role !== 'guest' && !courseId) {
    console.log('[Chat Controller] course_id missing for non-guest user');
    return res.status(400).json({ error: 'course_id is required' });
  }

  console.log('[Chat Controller] Creating session with studentId:', studentId, 'courseId:', courseId || 'null (guest)');
  const session = await studentChatService.createChatSession(studentId, courseId || null);
  console.log('[Chat Controller] Session created:', session);
  return created(res, session);
});

// Send message in a chat session
const sendMessage = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const sessionId = Number(req.params.sessionId);
  
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required and must be a non-empty string' });
  }

  const result = await studentChatService.sendMessage(sessionId, studentId, message.trim());
  return success(res, result);
});

// Get chat session details
const getChatSession = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const sessionId = Number(req.params.sessionId);
  
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const session = await studentChatService.getChatSession(sessionId, studentId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  return success(res, session);
});

// List chat sessions for a student
const listChatSessions = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const courseId = req.query.course_id ? Number(req.query.course_id) : undefined;
  const status = req.query.status;

  const sessions = await studentChatService.listChatSessions(studentId, {
    courseId,
    status,
    limit,
    offset
  });

  return success(res, { page, pageSize: limit, items: sessions });
});

// Get conversation history for a session
const getConversationHistory = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const sessionId = Number(req.params.sessionId);
  
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Verify session belongs to student
  const session = await studentChatService.getChatSession(sessionId, studentId);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const history = await studentChatService.getConversationHistory(sessionId);
  return success(res, { items: history });
});

// End a chat session
const endSession = asyncHandler(async (req, res) => {
  const studentId = Number(req.params.id);
  const sessionId = Number(req.params.sessionId);
  
  if (!canAccessStudent(req, studentId)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const session = await studentChatService.endSession(sessionId, studentId);
  return success(res, session);
});

module.exports = {
  createChatSession,
  sendMessage,
  getChatSession,
  listChatSessions,
  getConversationHistory,
  endSession
};

