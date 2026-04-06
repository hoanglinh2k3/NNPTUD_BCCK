const AppError = require('../../common/exceptions/app-error');
const { normalizePagination, buildMeta } = require('../../common/helpers/pagination.helper');
const { hashPassword } = require('../../common/utils/password.util');
const { buildFileUrl, getRelativeUploadPath } = require('../../common/utils/file.util');
const userRepository = require('./user.repository');

async function getUsers(query) {
  const pagination = normalizePagination(query);
  const [users, total] = await Promise.all([
    userRepository.findAll(query, pagination),
    userRepository.countAll(query)
  ]);

  return {
    data: users,
    meta: buildMeta(pagination.page, pagination.limit, total)
  };
}

async function getUserById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

async function createUser(payload) {
  const existingUser = await userRepository.findByEmail(payload.email);
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const role = await userRepository.findRoleById(payload.roleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  const passwordHash = await hashPassword(payload.password);
  return userRepository.create({
    ...payload,
    passwordHash
  });
}

async function updateUser(id, payload) {
  const currentUser = await userRepository.findAuthById(id);
  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  if (payload.email && payload.email !== currentUser.email) {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new AppError('Email already exists', 409);
    }
  }

  const nextRoleId = payload.roleId || currentUser.roleId;
  const role = await userRepository.findRoleById(nextRoleId);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return userRepository.update(id, {
    roleId: nextRoleId,
    fullName: payload.fullName || currentUser.fullName,
    email: payload.email || currentUser.email,
    phone: payload.phone !== undefined ? payload.phone : currentUser.phone,
    status: payload.status || currentUser.status
  });
}

async function updateUserStatus(id, status) {
  const currentUser = await userRepository.findById(id);
  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  return userRepository.updateStatus(id, status);
}

async function updateOwnProfile(userId, payload) {
  const currentUser = await userRepository.findById(userId);
  if (!currentUser) {
    throw new AppError('User not found', 404);
  }

  return userRepository.updateProfile(userId, {
    fullName: payload.fullName || currentUser.fullName,
    phone: payload.phone !== undefined ? payload.phone : currentUser.phone
  });
}

async function uploadAvatar(userId, file) {
  if (!file) {
    throw new AppError('Avatar file is required', 400);
  }

  const relativePath = getRelativeUploadPath(file.path);
  const avatarUrl = buildFileUrl(relativePath);
  return userRepository.updateAvatar(userId, avatarUrl);
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  updateOwnProfile,
  uploadAvatar
};
