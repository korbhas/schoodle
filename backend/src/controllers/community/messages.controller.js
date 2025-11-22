const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const communityService = require('../../services/community.service');

const listMessages = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const box = req.query.box || 'inbox';
  const unread = typeof req.query.unread === 'boolean' ? req.query.unread : undefined;
  const messages = await communityService.listMessages({
    userId: req.user.id,
    box,
    limit,
    offset,
    unread
  });
  return success(res, { page, pageSize: limit, items: messages });
});

const getMessage = asyncHandler(async (req, res) => {
  const message = await communityService.getMessageById(Number(req.params.messageId), req.user.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  return success(res, message);
});

const sendMessage = asyncHandler(async (req, res) => {
  const message = await communityService.sendMessage({
    senderId: req.user.id,
    recipientId: req.body.recipient_id,
    subject: req.body.subject,
    body: req.body.body
  });
  return created(res, message);
});

const markRead = asyncHandler(async (req, res) => {
  const message = await communityService.markMessageRead(Number(req.params.messageId), req.user.id);
  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }
  return success(res, message);
});

module.exports = {
  listMessages,
  getMessage,
  sendMessage,
  markRead
};

