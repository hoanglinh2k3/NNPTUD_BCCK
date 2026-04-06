const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const orderService = require('./order.service');

const checkout = asyncHandler(async (req, res) => {
  const order = await orderService.checkout(req.user.id, req.body);
  return sendCreated(res, 'Checkout completed successfully', order);
});

const getOrders = asyncHandler(async (req, res) => {
  const result = await orderService.getOrders(req.user, req.query);
  return sendSuccess(res, 'Orders fetched successfully', result.data, result.meta);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.user, req.params.id);
  return sendSuccess(res, 'Order fetched successfully', order);
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.user, req.params.id, req.body.status);
  return sendSuccess(res, 'Order status updated successfully', order);
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOrder(req.user, req.params.id);
  return sendSuccess(res, 'Order cancelled successfully', order);
});

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
