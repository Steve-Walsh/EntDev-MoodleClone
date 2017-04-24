  var express = require('express');
  var controller = require('./section.controller');
  var multer = require('multer');
  var upload = multer({ dest: __dirname + '/../../public/data/files' })

  var router = express.Router();

  router.get('/', controller.index);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.destroy);
  router.post('/register', controller.create);
  router.post('/upload', upload.single("sectionFile"), controller.uploadFile);
  router.get('/downloadFile/:id', controller.downloadFile)
  router.post('/removeFile', controller.removeFile)
  router.post('/showFile', controller.showFile)
  router.post('/hideFile', controller.hideFile)
  
  // router.post('/getMany', controller.getMany);


  module.exports = router;
