module.exports = function(app) {

	app.use('/api/users', require('./api/users/index'));  
	app.use('/api/modules', require('./api/modules/index')); 
	app.use('/api/sections', require('./api/section/index')); 
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|app|assets)/*')
  .get(function(req, res) {
  	res.send(404);
  })

};




// module.exports = function(app) {

//   app.use('/api/users', require('./api/user/index'));
//   app.use('/api/mobiles', require('./api/mobile/index'));
//   app.use('/api/events', require('./api/event/index'));
//   app.use('/api/pictures', require('./api/picture/index'));

//   // All undefined asset or api routes should return a 404

//   app.route('/:url(api|app|assets)/*')
//    .get(function(req, res) {
//     res.send(404);
//   })

// };

