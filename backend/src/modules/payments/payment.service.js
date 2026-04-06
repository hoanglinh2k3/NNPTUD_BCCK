const AppError = require('../../common/exceptions/app-error');
const paymentRepository = require('./payment.repository');

function canAccessOrder(order, currentUser) {
  if (currentUser.role === 'Customer' && order.userId !== currentUser.id) {
    throw new AppError('Forbidden', 403);
  }
}

async function createPayment(payload) {
  const order = await paymentRepository.findOrderById(payload.orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const payment = await paymentRepository.create(payload);
  await paymentRepository.syncOrderPaymentStatus(payload.orderId, payload.status);
  return payment;
}

async function getPaymentByOrderId(currentUser, orderId) {
  const order = await paymentRepository.findOrderById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  canAccessOrder(order, currentUser);

  const payment = await paymentRepository.findByOrderId(orderId);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  return payment;
}

async function updatePaymentStatus(id, payload) {
  const payment = await paymentRepository.findById(id);
  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  const updatedPayment = await paymentRepository.updateStatus(id, payload.status, payload.transactionCode);
  await paymentRepository.syncOrderPaymentStatus(payment.orderId, payload.status);
  return updatedPayment;
}

module.exports = {
  createPayment,
  getPaymentByOrderId,
  updatePaymentStatus
};
