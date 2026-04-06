const AppError = require('../../common/exceptions/app-error');
const roleRepository = require('./role.repository');

async function getRoles() {
  return roleRepository.findAll();
}

async function getRoleById(id) {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  return role;
}

async function createRole(payload) {
  const existingRole = await roleRepository.findByName(payload.name);
  if (existingRole) {
    throw new AppError('Role already exists', 409);
  }

  return roleRepository.create(payload);
}

async function updateRole(id, payload) {
  const currentRole = await roleRepository.findById(id);
  if (!currentRole) {
    throw new AppError('Role not found', 404);
  }

  if (payload.name && payload.name !== currentRole.name) {
    const sameNameRole = await roleRepository.findByName(payload.name);
    if (sameNameRole) {
      throw new AppError('Role name already exists', 409);
    }
  }

  return roleRepository.update(id, {
    name: payload.name || currentRole.name,
    description: payload.description !== undefined ? payload.description : currentRole.description
  });
}

async function deleteRole(id) {
  const role = await roleRepository.findById(id);
  if (!role) {
    throw new AppError('Role not found', 404);
  }

  const usersCount = await roleRepository.countUsersByRoleId(id);
  if (usersCount > 0) {
    throw new AppError('Cannot delete role that is already assigned to users', 409);
  }

  await roleRepository.remove(id);
  return { deleted: true };
}

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
