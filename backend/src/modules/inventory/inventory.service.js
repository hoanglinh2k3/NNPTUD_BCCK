const AppError = require('../../common/exceptions/app-error');
const { normalizePagination, buildMeta } = require('../../common/helpers/pagination.helper');
const inventoryRepository = require('./inventory.repository');

async function getInventory(query) {
  const pagination = normalizePagination(query);
  const [items, total] = await Promise.all([
    inventoryRepository.findAll(query, pagination),
    inventoryRepository.countAll(query)
  ]);

  return {
    data: items,
    meta: buildMeta(pagination.page, pagination.limit, total)
  };
}

async function getInventoryByProductId(productId) {
  const inventory = await inventoryRepository.findByProductId(productId);
  if (!inventory) {
    throw new AppError('Inventory not found', 404);
  }

  return inventory;
}

async function addStock(productId, quantity) {
  const inventory = await getInventoryByProductId(productId);
  return inventoryRepository.updateQuantity(productId, inventory.quantity + quantity);
}

async function removeStock(productId, quantity) {
  const inventory = await getInventoryByProductId(productId);
  if (inventory.quantity - inventory.reservedQuantity < quantity) {
    throw new AppError('Not enough available stock to remove', 400);
  }

  return inventoryRepository.updateQuantity(productId, inventory.quantity - quantity);
}

async function reserveStock(productId, quantity) {
  const inventory = await getInventoryByProductId(productId);
  if (inventory.quantity < quantity) {
    throw new AppError('Not enough stock to reserve', 400);
  }

  return inventoryRepository.updateReserve(
    productId,
    inventory.reservedQuantity + quantity,
    inventory.quantity - quantity
  );
}

async function markSold(productId, quantity) {
  const inventory = await getInventoryByProductId(productId);
  if (inventory.reservedQuantity >= quantity) {
    return inventoryRepository.updateSold(
      productId,
      inventory.quantity,
      inventory.reservedQuantity - quantity,
      inventory.soldQuantity + quantity
    );
  }

  if (inventory.quantity < quantity) {
    throw new AppError('Not enough stock to mark as sold', 400);
  }

  return inventoryRepository.updateSold(
    productId,
    inventory.quantity - quantity,
    inventory.reservedQuantity,
    inventory.soldQuantity + quantity
  );
}

module.exports = {
  getInventory,
  getInventoryByProductId,
  addStock,
  removeStock,
  reserveStock,
  markSold
};
