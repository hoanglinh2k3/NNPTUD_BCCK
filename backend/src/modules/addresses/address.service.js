const AppError = require('../../common/exceptions/app-error');
const addressRepository = require('./address.repository');

async function getAddresses(userId) {
  return addressRepository.findAllByUserId(userId);
}

async function getAddressById(userId, id) {
  const address = await addressRepository.findByIdAndUser(id, userId);
  if (!address) {
    throw new AppError('Address not found', 404);
  }

  return address;
}

async function createAddress(userId, payload) {
  const addressCount = await addressRepository.countByUserId(userId);
  const isDefault = payload.isDefault || addressCount === 0;

  if (isDefault) {
    await addressRepository.clearDefault(userId);
  }

  return addressRepository.create(userId, {
    ...payload,
    isDefault
  });
}

async function updateAddress(userId, id, payload) {
  const currentAddress = await addressRepository.findByIdAndUser(id, userId);
  if (!currentAddress) {
    throw new AppError('Address not found', 404);
  }

  const nextIsDefault =
    payload.isDefault !== undefined ? payload.isDefault : Boolean(currentAddress.isDefault);

  if (nextIsDefault) {
    await addressRepository.clearDefault(userId);
  }

  return addressRepository.update(id, userId, {
    receiverName: payload.receiverName || currentAddress.receiverName,
    phone: payload.phone || currentAddress.phone,
    province: payload.province !== undefined ? payload.province : currentAddress.province,
    district: payload.district !== undefined ? payload.district : currentAddress.district,
    ward: payload.ward !== undefined ? payload.ward : currentAddress.ward,
    detailAddress:
      payload.detailAddress !== undefined ? payload.detailAddress : currentAddress.detailAddress,
    isDefault: nextIsDefault
  });
}

async function setDefaultAddress(userId, id, isDefault) {
  const currentAddress = await addressRepository.findByIdAndUser(id, userId);
  if (!currentAddress) {
    throw new AppError('Address not found', 404);
  }

  if (isDefault) {
    await addressRepository.clearDefault(userId);
  }

  return addressRepository.update(id, userId, {
    receiverName: currentAddress.receiverName,
    phone: currentAddress.phone,
    province: currentAddress.province,
    district: currentAddress.district,
    ward: currentAddress.ward,
    detailAddress: currentAddress.detailAddress,
    isDefault
  });
}

async function deleteAddress(userId, id) {
  const currentAddress = await addressRepository.findByIdAndUser(id, userId);
  if (!currentAddress) {
    throw new AppError('Address not found', 404);
  }

  await addressRepository.remove(id, userId);
  return { deleted: true };
}

module.exports = {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
};
