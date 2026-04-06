const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const roleService = require('./role.service');

const getRoles = asyncHandler(async (_req, res) => {
  const roles = await roleService.getRoles();
  return sendSuccess(res, 'Roles fetched successfully', roles);
});

const getRoleById = asyncHandler(async (req, res) => {
  const role = await roleService.getRoleById(req.params.id);
  return sendSuccess(res, 'Role fetched successfully', role);
});

const createRole = asyncHandler(async (req, res) => {
  const role = await roleService.createRole(req.body);
  return sendCreated(res, 'Role created successfully', role);
});

const updateRole = asyncHandler(async (req, res) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  return sendSuccess(res, 'Role updated successfully', role);
});

const deleteRole = asyncHandler(async (req, res) => {
  const result = await roleService.deleteRole(req.params.id);
  return sendSuccess(res, 'Role deleted successfully', result);
});

module.exports = {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
};
