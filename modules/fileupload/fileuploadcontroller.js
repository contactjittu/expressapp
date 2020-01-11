'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const logger = require('../../utils/logger');
const fs = require('fs');
const dir = '././uploads';

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, dir);
  },
  filename: function (req, file, callback) {
    const fileExtension = file.originalname.split('.').pop();
    callback(null, 'file_' + Date.now() + '.' + fileExtension);
  }
})

const fileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return callback(new Error('Only image file are allowed!'), false);
  }
  callback(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter }).array('profilePic');

router.post('/uploadImage', upload, function (req, res) {
  const fileArray = [];
  try {
    var files = req.files;
    files.forEach(function (file) {
      fileArray.push({ 'fileId': file.filename })
    });
  }
  catch (e) {
    logger.error(e.stack);
    return res.status(500).send({ success: false, msg: 'Internal Server Error' });
  }
  return res.status(200).send({ success: true, msg: 'File is uploaded', data: fileArray });
});


router.get('/getImage/:fileId', function (req, res) {

  const file = req.params.fileId;
  if (!file) {
    return res.status(400).send('<p>Bad Request</p>');
  }
  fs.readFile(dir + '/' + file, function (err, content) {
    if (err) {
      logger.error(err.stack);
      if (err.code === 'ENOENT') {
        return res.status(404).send('<p>Not Found</P>')
      }
      return res.status(500).send('<p>Internal Server Error</P>');
    }
    else {
      res.writeHead(200, { 'Content-Type': 'image/jpg' });
      res.end(content, 'binary');
      return;
    }
  });
});

module.exports = router;