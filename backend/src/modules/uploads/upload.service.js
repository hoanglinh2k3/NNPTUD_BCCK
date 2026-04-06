const AppError = require('../../common/exceptions/app-error');
const { buildFileUrl, getRelativeUploadPath } = require('../../common/utils/file.util');
const uploadRepository = require('./upload.repository');

async function uploadFile(userId, file, uploadType) {
  if (!file) {
    throw new AppError('File is required', 400);
  }

  const relativePath = getRelativeUploadPath(file.path);
  const record = await uploadRepository.create({
    userId,
    originalName: file.originalname,
    storedName: file.filename,
    filePath: buildFileUrl(relativePath),
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadType
  });

  return {
    ...record,
    url: record.filePath
  };
}

module.exports = {
  uploadFile
};
