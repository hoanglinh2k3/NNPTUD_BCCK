const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { ensureDirectory, resolveUploadPath } = require('../common/utils/file.util');

function createStorage(folder) {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      const destination = resolveUploadPath(folder);
      ensureDirectory(destination);
      cb(null, destination);
    },
    filename: (_req, file, cb) => {
      const extension = path.extname(file.originalname);
      cb(null, `${Date.now()}-${uuidv4()}${extension}`);
    }
  });
}

function createUploader(folder, fileFilter = null) {
  return multer({
    storage: createStorage(folder),
    fileFilter
  });
}

function imageFilter(_req, file, cb) {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }

  return cb(new Error('Only image files are allowed'));
}

const avatarUpload = createUploader('avatars', imageFilter);
const productImagesUpload = createUploader('products', imageFilter);
const messageFileUpload = createUploader('messages');
const genericImageUpload = createUploader('products', imageFilter);
const genericFileUpload = createUploader('messages');

module.exports = {
  avatarUpload,
  productImagesUpload,
  messageFileUpload,
  genericImageUpload,
  genericFileUpload
};
