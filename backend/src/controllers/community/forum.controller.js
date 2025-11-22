const asyncHandler = require('../../utils/asyncHandler');
const { success, paginate } = require('../../utils/response');
const communityService = require('../../services/community.service');

const listThreads = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const threads = await communityService.listThreads({
    locked: req.query.locked,
    limit,
    offset
  });
  return success(res, { page, pageSize: limit, items: threads });
});

const lockThread = asyncHandler(async (req, res) => {
  const thread = await communityService.lockThread(Number(req.params.threadId), req.body.is_locked);
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  return success(res, thread);
});

const deleteThread = asyncHandler(async (req, res) => {
  await communityService.deleteThread(Number(req.params.threadId));
  return success(res, { message: 'Thread removed' });
});

const listPosts = asyncHandler(async (req, res) => {
  const { limit, offset } = paginate(req.query);
  const page = Number(req.query.page) || 1;
  const posts = await communityService.listPendingPosts({ limit, offset });
  return success(res, { page, pageSize: limit, items: posts });
});

const deletePost = asyncHandler(async (req, res) => {
  await communityService.deletePost(Number(req.params.postId));
  return success(res, { message: 'Post removed' });
});

module.exports = {
  listThreads,
  lockThread,
  deleteThread,
  listPosts,
  deletePost
};

