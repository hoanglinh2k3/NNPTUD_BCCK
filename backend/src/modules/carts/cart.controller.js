const asyncHandler = require('../../common/helpers/async-handler');
const { sendSuccess } = require('../../common/response/api-response');
const cartService = require('./cart.service');

const getCurrentCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCurrentCart(req.user.id);
  return sendSuccess(res, 'Cart fetched successfully', cart);
});

const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body);
  return sendSuccess(res, 'Cart item added successfully', cart);
});

const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.id, req.body.quantity);
  return sendSuccess(res, 'Cart item updated successfully', cart);
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.id);
  return sendSuccess(res, 'Cart item removed successfully', cart);
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clearCart(req.user.id);
  return sendSuccess(res, 'Cart cleared successfully', cart);
});

module.exports = {
  getCurrentCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
