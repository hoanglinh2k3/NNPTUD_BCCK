const AppError = require('../../common/exceptions/app-error');
const { ORDER_STATUS } = require('../../common/constants/order-status.constant');
const { PAYMENT_STATUS } = require('../../common/constants/payment-status.constant');
const { normalizePagination, buildMeta } = require('../../common/helpers/pagination.helper');
const generateOrderCode = require('../../common/helpers/order-code.helper');
const { createTransaction } = require('../../database/connection');
const { getIO } = require('../../sockets');
const orderRepository = require('./order.repository');

function canAccessOrder(order, currentUser) {
  if (currentUser.role === 'Customer' && order.userId !== currentUser.id) {
    throw new AppError('Forbidden', 403);
  }
}

async function hydrateOrder(orderId, currentUser) {
  const order = await orderRepository.findById(orderId);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  canAccessOrder(order, currentUser);

  const [items, payment] = await Promise.all([
    orderRepository.findOrderItems(orderId),
    orderRepository.findPaymentByOrderId(orderId)
  ]);

  return {
    ...order,
    items,
    payment
  };
}

function emitOrderEvents(userId, orderId, status, notification) {
  const io = getIO();
  io.to(`notification:${userId}`).emit('new_notification', notification);
  io.to(`notification:${userId}`).emit('order_status_updated', {
    userId,
    orderId,
    status
  });
}

async function checkout(userId, payload) {
  const transaction = await createTransaction();

  try {
    const address = await orderRepository.findAddressByIdAndUser(payload.addressId, userId, transaction);
    if (!address) {
      throw new AppError('Address not found', 404);
    }

    const cart = await orderRepository.findCartByUserId(userId, transaction);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const cartItems = await orderRepository.findCartItemsByCartId(cart.id, transaction);
    if (!cartItems.length) {
      throw new AppError('Cart is empty', 400);
    }

    const inventoryMap = new Map();
    let totalAmount = 0;

    for (const item of cartItems) {
      const inventory = await orderRepository.lockInventoryByProductId(item.productId, transaction);
      if (!inventory || inventory.quantity < item.quantity) {
        throw new AppError(`Not enough stock for ${item.productName}`, 400);
      }

      inventoryMap.set(item.productId, inventory);
      totalAmount += Number(item.subTotal);
    }

    const paymentStatus =
      payload.paymentMethod.toUpperCase() === 'COD' ? PAYMENT_STATUS.UNPAID : PAYMENT_STATUS.PENDING;

    const orderCode = generateOrderCode();
    const createdOrder = await orderRepository.createOrder(transaction, {
      userId,
      addressId: payload.addressId,
      orderCode,
      totalAmount,
      status: ORDER_STATUS.PENDING,
      paymentStatus,
      note: payload.note
    });

    for (const item of cartItems) {
      await orderRepository.createOrderItem(transaction, {
        orderId: createdOrder.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subTotal: item.subTotal
      });

      const inventory = inventoryMap.get(item.productId);
      await orderRepository.updateInventoryAfterCheckout(
        transaction,
        item.productId,
        inventory.quantity - item.quantity,
        inventory.soldQuantity + item.quantity
      );
    }

    await orderRepository.createPayment(transaction, {
      orderId: createdOrder.id,
      method: payload.paymentMethod,
      amount: totalAmount,
      status: paymentStatus
    });

    await orderRepository.clearCartItems(transaction, cart.id);

    const notification = {
      userId,
      title: 'Order created successfully',
      content: `Your order ${orderCode} has been created.`,
      type: 'ORDER'
    };

    await orderRepository.createNotification(transaction, notification);
    await transaction.commit();

    emitOrderEvents(userId, createdOrder.id, ORDER_STATUS.PENDING, notification);
    return hydrateOrder(createdOrder.id, { id: userId, role: 'Customer' });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function getOrders(currentUser, query) {
  const pagination = normalizePagination(query);
  const [orders, total] = await Promise.all([
    orderRepository.findAll(query, pagination, currentUser),
    orderRepository.countAll(query, currentUser)
  ]);

  return {
    data: orders,
    meta: buildMeta(pagination.page, pagination.limit, total)
  };
}

async function getOrderById(currentUser, id) {
  return hydrateOrder(id, currentUser);
}

async function updateOrderStatus(currentUser, id, status) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (status === ORDER_STATUS.CANCELLED) {
    return cancelOrder(currentUser, id);
  }

  await orderRepository.updateStatus(id, status);
  const notification = {
    userId: order.userId,
    title: 'Order status updated',
    content: `Your order ${order.orderCode} is now ${status}.`,
    type: 'ORDER'
  };
  await orderRepository.createNotification(null, notification);
  emitOrderEvents(order.userId, id, status, notification);

  return hydrateOrder(id, currentUser);
}

async function cancelOrder(currentUser, id) {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  canAccessOrder(order, currentUser);

  if (currentUser.role === 'Customer') {
    const customerAllowed = [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED];
    if (!customerAllowed.includes(order.status)) {
      throw new AppError('Customer can only cancel pending or confirmed orders', 400);
    }
  } else if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.DELIVERED, ORDER_STATUS.RETURNED].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  const transaction = await createTransaction();

  try {
    const orderItems = await orderRepository.findOrderItems(id, transaction);

    for (const item of orderItems) {
      const inventory = await orderRepository.lockInventoryByProductId(item.productId, transaction);
      if (!inventory) {
        throw new AppError('Inventory not found for order item', 404);
      }

      await orderRepository.restoreInventory(
        transaction,
        item.productId,
        inventory.quantity + item.quantity,
        Math.max(0, inventory.soldQuantity - item.quantity)
      );
    }

    await orderRepository.updateStatus(id, ORDER_STATUS.CANCELLED, transaction);

    const notification = {
      userId: order.userId,
      title: 'Order cancelled',
      content: `Your order ${order.orderCode} has been cancelled.`,
      type: 'ORDER'
    };

    await orderRepository.createNotification(transaction, notification);
    await transaction.commit();

    emitOrderEvents(order.userId, id, ORDER_STATUS.CANCELLED, notification);
    return hydrateOrder(id, currentUser);
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

module.exports = {
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
