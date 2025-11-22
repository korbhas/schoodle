const asyncHandler = require('../../utils/asyncHandler');
const { success, created } = require('../../utils/response');
const communityService = require('../../services/community.service');

const listClubs = asyncHandler(async (req, res) => {
  const items = await communityService.listClubsAdmin();
  return success(res, { items });
});

const createClub = asyncHandler(async (req, res) => {
  const club = await communityService.createClub(req.body);
  return created(res, club);
});

const updateClub = asyncHandler(async (req, res) => {
  const club = await communityService.updateClub(Number(req.params.clubId), req.body);
  if (!club) {
    return res.status(404).json({ error: 'Club not found' });
  }
  return success(res, club);
});

const deleteClub = asyncHandler(async (req, res) => {
  await communityService.deleteClub(Number(req.params.clubId));
  return success(res, { message: 'Club removed' });
});

const listMembers = asyncHandler(async (req, res) => {
  const members = await communityService.listClubMembers(Number(req.params.clubId));
  return success(res, { items: members });
});

const addMember = asyncHandler(async (req, res) => {
  const members = await communityService.addClubMember(
    Number(req.params.clubId),
    req.body.student_id,
    req.body.role
  );
  return success(res, { items: members });
});

const removeMember = asyncHandler(async (req, res) => {
  const members = await communityService.removeClubMember(
    Number(req.params.clubId),
    Number(req.params.studentId)
  );
  return success(res, { items: members });
});

module.exports = {
  listClubs,
  createClub,
  updateClub,
  deleteClub,
  listMembers,
  addMember,
  removeMember
};

