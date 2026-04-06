const asyncHandler = require('../../common/helpers/async-handler');
const { sendSuccess } = require('../../common/response/api-response');
const inventoryService = require('./inventory.service');

const getInventory = asyncHandler(async (req, res) => {
  const result = await inventoryService.getInventory(req.query);
  return sendSuccess(res, 'Inventory fetched successfully', result.data, result.meta);
});

const getInventoryByProductId = asyncHandler(async (req, res) => {
  const item = await inventoryService.getInventoryByProductId(req.params.productId);
  return sendSuccess(res, 'Inventory item fetched successfully', item);
});

const addStock = asyncHandler(async (req, res) => {
  const item = await inventoryService.addStock(req.params.productId, req.body.quantity);
  return sendSuccess(res, 'Stock added successfully', item);
});

const removeStock = asyncHandler(async (req, res) => {
  const item = await inventoryService.removeStock(req.params.productId, req.body.quantity);
  return sendSuccess(res, 'Stock removed successfully', item);
});

const reserveStock = asyncHandler(async (req, res) => {
  const item = await inventoryService.reserveStock(req.params.productId, req.body.quantity);
  return sendSuccess(res, 'Stock reserved successfully', item);
});

const markSold = asyncHandler(async (req, res) => {
  const item = await inventoryService.markSold(req.params.productId, req.body.quantity);
  return sendSuccess(res, 'Inventory updated successfully', item);
});

module.exports = {
  getInventory,
  getInventoryByProductId,
  addStock,
  removeStock,
  reserveStock,
  markSold
};
