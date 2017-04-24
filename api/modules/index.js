  var express = require('express');
  var controller = require('./module.controller');

  var router = express.Router();

  router.get('/', controller.index);
  // router.put('/:id', controller.update);
  // router.delete('/:id', controller.destroy);
  // router.post('/register', controller.create);
  router.post('/createNewModule', controller.create);
  router.post('/addSection', controller.addSection);
  router.get('/module/:id', controller.getModule);
  router.get('/getMyModules/:id', controller.getMyModules);
  router.post('/importSections/', controller.importSections)
  router.post('/unlinkSection', controller.unlinkSection)
  router.post('/showSection', controller.showSection)
  router.post('/hideSection', controller.hideSection)
  router.post('/enrollStudent', controller.enrollStudent)
  router.post('/removeStudent', controller.removeStudent)
  router.post('/removeSection', controller.removeSection)
  router.post('/deleteModule', controller.deleteModule)






  module.exports = router;
