const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated, sendSuccess } = require('../../common/response/api-response');
const paymentService = require('./payment.service');

const createPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.createPayment(req.body);
  return sendCreated(res, 'Payment created successfully', payment);
});

const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentByOrderId(req.user, req.params.orderId);
  return sendSuccess(res, 'Payment fetched successfully', payment);
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const payment = await paymentService.updatePaymentStatus(req.params.id, req.body);
  return sendSuccess(res, 'Payment status updated successfully', payment);
});

module.exports = {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus
};
