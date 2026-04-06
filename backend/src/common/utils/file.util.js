const fs = require('fs');
const path = require('path');
const env = require('../../config/env');

function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

function buildFileUrl(relativePath = '') {
  return `${env.uploadBaseUrl}/${relativePath.replace(/\\/g, '/')}`;
}

function resolveUploadPath(...segments) {
  return path.join(__dirname, '..', '..', '..', 'uploads', ...segments);
}

function getRelativeUploadPath(filePath) {
  return filePath.replace(/^.*uploads[\\/]/, '').replace(/\\/g, '/');
}

module.exports = {
  ensureDirectory,
  buildFileUrl,
  resolveUploadPath,
  getRelativeUploadPath
};
