const asyncHandler = require('../../utils/asyncHandler');
const { success, created } = require('../../utils/response');
const communityService = require('../../services/community.service');

const listAnnouncements = asyncHandler(async (req, res) => {
  const items = await communityService.listGlobalAnnouncements();
  return success(res, { items });
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await communityService.createGlobalAnnouncement(req.body);
  return created(res, announcement);
});

const updateAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await communityService.updateAnnouncement(Number(req.params.announcementId), req.body);
  if (!announcement) {
    return res.status(404).json({ error: 'Announcement not found' });
  }
  return success(res, announcement);
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  await communityService.deleteAnnouncement(Number(req.params.announcementId));
  return success(res, { message: 'Announcement removed' });
});

module.exports = {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
};

