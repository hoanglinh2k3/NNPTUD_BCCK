const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const addressService = require('./address.service');

const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getAddresses(req.user.id);
  return sendSuccess(res, 'Addresses fetched successfully', addresses);
});

const getAddressById = asyncHandler(async (req, res) => {
  const address = await addressService.getAddressById(req.user.id, req.params.id);
  return sendSuccess(res, 'Address fetched successfully', address);
});

const createAddress = asyncHandler(async (req, res) => {
  const address = await addressService.createAddress(req.user.id, req.body);
  return sendCreated(res, 'Address created successfully', address);
});

const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.user.id, req.params.id, req.body);
  return sendSuccess(res, 'Address updated successfully', address);
});

const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.user.id, req.params.id, req.body.isDefault);
  return sendSuccess(res, 'Default address updated successfully', address);
});

const deleteAddress = asyncHandler(async (req, res) => {
  const result = await addressService.deleteAddress(req.user.id, req.params.id);
  return sendSuccess(res, 'Address deleted successfully', result);
});

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
};
