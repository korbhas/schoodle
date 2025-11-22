const asyncHandler = require('../../utils/asyncHandler');
const { success, created, paginate } = require('../../utils/response');
const communityService = require('../../services/community.service');

const listEvents = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const events = await communityService.listEventsAdmin({
    category: req.query.category,
    upcoming: req.query.upcoming,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: events });
});

const createEvent = asyncHandler(async (req, res) => {
  const event = await communityService.createEvent(req.body);
  return created(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event = await communityService.updateEvent(Number(req.params.eventId), req.body);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  return success(res, event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  await communityService.deleteEvent(Number(req.params.eventId));
  return success(res, { message: 'Event removed' });
});

const listParticipants = asyncHandler(async (req, res) => {
  const participants = await communityService.listParticipants(Number(req.params.eventId));
  return success(res, { items: participants });
});

const registerParticipant = asyncHandler(async (req, res) => {
  const participants = await communityService.registerParticipant(
    Number(req.params.eventId),
    req.body.user_id,
    req.body.status
  );
  return success(res, { items: participants });
});

const removeParticipant = asyncHandler(async (req, res) => {
  const participants = await communityService.removeParticipant(
    Number(req.params.eventId),
    Number(req.params.userId)
  );
  return success(res, { items: participants });
});

module.exports = {
  listEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listParticipants,
  registerParticipant,
  removeParticipant
};

