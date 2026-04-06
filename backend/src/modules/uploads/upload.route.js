const express = require('express');
const authMiddleware = require('../../middlewares/auth.middleware');
const { genericFileUpload, genericImageUpload } = require('../../middlewares/upload.middleware');
const uploadController = require('./upload.controller');

const router = express.Router();

router.post('/image', authMiddleware, genericImageUpload.single('file'), uploadController.uploadImage);
router.post('/file', authMiddleware, genericFileUpload.single('file'), uploadController.uploadFile);

module.exports = router;
