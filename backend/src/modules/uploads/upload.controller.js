const asyncHandler = require('../../common/helpers/async-handler');
const { sendCreated } = require('../../common/response/api-response');
const uploadService = require('./upload.service');

const uploadImage = asyncHandler(async (req, res) => {
  const file = await uploadService.uploadFile(req.user.id, req.file, 'IMAGE');
  return sendCreated(res, 'Image uploaded successfully', file);
});

const uploadFile = asyncHandler(async (req, res) => {
  const file = await uploadService.uploadFile(req.user.id, req.file, 'FILE');
  return sendCreated(res, 'File uploaded successfully', file);
});

module.exports = {
  uploadImage,
  uploadFile
};
