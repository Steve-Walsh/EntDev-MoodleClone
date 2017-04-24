  var express = require('express');
  var controller = require('./user.controller');

  var router = express.Router();

  router.get('/', controller.index);
  // router.put('/:id', controller.update);
  // router.delete('/:id', controller.destroy);
  router.post('/registerNewUser', controller.create);
  router.post('/authenticate', controller.login);
  router.get('/students', controller.getStudents);



  module.exports = router;

