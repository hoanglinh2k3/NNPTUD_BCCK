const AppError = require('../../common/exceptions/app-error');
const { ROLES } = require('../../common/constants/roles.constant');
const { hashPassword, comparePassword } = require('../../common/utils/password.util');
const { signAccessToken } = require('../../common/utils/jwt.util');
const authRepository = require('./auth.repository');

function mapAuthUser(user) {
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    roleId: user.roleId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

async function register(payload) {
  const existingUser = await authRepository.findUserByEmail(payload.email);
  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const customerRole = await authRepository.findRoleByName(ROLES.CUSTOMER);
  if (!customerRole) {
    throw new AppError('Customer role has not been seeded', 500);
  }

  const passwordHash = await hashPassword(payload.password);
  const user = await authRepository.createUser({
    ...payload,
    roleId: customerRole.id,
    passwordHash
  });

  return mapAuthUser(user);
}

async function login(payload) {
  const user = await authRepository.findUserByEmail(payload.email);
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const isMatch = await comparePassword(payload.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.status !== 'ACTIVE') {
    throw new AppError('Your account is not active', 403);
  }

  const safeUser = mapAuthUser(user);
  const accessToken = signAccessToken({
    id: user.id,
    roleId: user.roleId,
    role: user.role,
    email: user.email,
    fullName: user.fullName
  });

  return {
    accessToken,
    user: safeUser
  };
}

async function getProfile(userId) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return mapAuthUser(user);
}

async function changePassword(userId, payload) {
  const user = await authRepository.findUserById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isMatch = await comparePassword(payload.oldPassword, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Old password is incorrect', 400);
  }

  const passwordHash = await hashPassword(payload.newPassword);
  await authRepository.updatePassword(userId, passwordHash);

  return { changed: true };
}

module.exports = {
  register,
  login,
  getProfile,
  changePassword
};
