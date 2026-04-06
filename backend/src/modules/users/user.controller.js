const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const userService = require('./user.service');

const getUsers = asyncHandler(async (req, res) => {
  const result = await userService.getUsers(req.query);
  return sendSuccess(res, 'Users fetched successfully', result.data, result.meta);
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  return sendSuccess(res, 'User fetched successfully', user);
});

const createUser = asyncHandler(async (req, res) => {
  const user = await userService.createUser(req.body);
  return sendCreated(res, 'User created successfully', user);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);
  return sendSuccess(res, 'User updated successfully', user);
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await userService.updateUserStatus(req.params.id, req.body.status);
  return sendSuccess(res, 'User status updated successfully', user);
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateOwnProfile(req.user.id, req.body);
  return sendSuccess(res, 'Profile updated successfully', user);
});

const uploadAvatar = asyncHandler(async (req, res) => {
  const user = await userService.uploadAvatar(req.user.id, req.file);
  return sendSuccess(res, 'Avatar uploaded successfully', user);
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateProfile,
  uploadAvatar
};
