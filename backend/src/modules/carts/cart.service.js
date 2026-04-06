const AppError = require('../../common/exceptions/app-error');
const cartRepository = require('./cart.repository');

async function getOrCreateCart(userId) {
  let cart = await cartRepository.findCartByUserId(userId);
  if (!cart) {
    await cartRepository.createCart(userId);
    cart = await cartRepository.findCartByUserId(userId);
  }

  return cart;
}

function buildCartResponse(cart, items) {
  const subTotal = items.reduce((sum, item) => sum + Number(item.subTotal || 0), 0);
  const totalItems = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  return {
    id: cart.id,
    userId: cart.userId,
    items,
    summary: {
      totalItems,
      subTotal
    }
  };
}

async function getCurrentCart(userId) {
  const cart = await getOrCreateCart(userId);
  const items = await cartRepository.findCartItems(cart.id);
  return buildCartResponse(cart, items);
}

async function addItem(userId, payload) {
  const cart = await getOrCreateCart(userId);
  const product = await cartRepository.findProductForCart(payload.productId);
  if (!product || product.status === 'INACTIVE') {
    throw new AppError('Product is not available', 404);
  }

  const existingItem = await cartRepository.findItemByCartAndProduct(cart.id, payload.productId);
  const nextQuantity = payload.quantity + (existingItem?.quantity || 0);

  if (product.inventoryQuantity < nextQuantity) {
    throw new AppError('Not enough stock for this product', 400);
  }

  const unitPrice = product.discountPrice || product.price;

  if (existingItem) {
    await cartRepository.updateItem(existingItem.id, nextQuantity, unitPrice);
  } else {
    await cartRepository.insertItem(cart.id, payload.productId, payload.quantity, unitPrice);
  }

  const items = await cartRepository.findCartItems(cart.id);
  return buildCartResponse(cart, items);
}

async function updateItem(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const cartItem = await cartRepository.findItemById(itemId, cart.id);
  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  const product = await cartRepository.findProductForCart(cartItem.productId);
  if (!product || product.status === 'INACTIVE') {
    throw new AppError('Product is not available', 404);
  }

  if (product.inventoryQuantity < quantity) {
    throw new AppError('Not enough stock for this product', 400);
  }

  const unitPrice = product.discountPrice || product.price;
  await cartRepository.updateItem(itemId, quantity, unitPrice);
  const items = await cartRepository.findCartItems(cart.id);
  return buildCartResponse(cart, items);
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const cartItem = await cartRepository.findItemById(itemId, cart.id);
  if (!cartItem) {
    throw new AppError('Cart item not found', 404);
  }

  await cartRepository.deleteItem(itemId);
  const items = await cartRepository.findCartItems(cart.id);
  return buildCartResponse(cart, items);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await cartRepository.clearItems(cart.id);
  const items = await cartRepository.findCartItems(cart.id);
  return buildCartResponse(cart, items);
}

module.exports = {
  getCurrentCart,
  addItem,
  updateItem,
  removeItem,
  clearCart
};
