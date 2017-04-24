var express = require('express');
var moment = require('moment');
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var jwt         = require('jwt-simple');
var passport    = require('passport');
var config      = require('./config/database'); // get db config file
var User        = require('./api/users/user.model.js'); // get the mongoose model
var port        = process.env.PORT || 3000;
var jwt         = require('jwt-simple');
var multer      = require('multer')



var app = express();
var mongoose = require('mongoose');    
mongoose.connect('mongodb://localhost/moodle'); 
mongoose.Promise = global.Promise;


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// log to console
app.use(morgan('dev'));

// Use the passport package in our application
app.use(passport.initialize())

require('./config/express').addMiddleware(app)
require('./config/passport')(passport);


app.post('/authenticate', function (req, res) {
	console.log("inside")
	console.log(req.body);

	User.findOne({
		email: req.body.email
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			console.log("not user")
			res.send({success: false, msg: 'Authentication failed. User not found.'});
		} else {
      // check if password matches
      user.comparePassword(req.body.password, function (err, isMatch) {
      	if (isMatch && !err) {
          // if user is found and password is right create a token
          var token = jwt.encode(user, config.secret);
          // return the information including token as JSON
          console.log(token);
          res.json({success: true, token: 'JWT ' + token});
      } else {
      	console.log("false")
      	res.send({success: false, msg: 'Authentication failed. Wrong password.'});
      }
  });
  }
})
});



require('./config/express').addMiddleware(app)

require('./routes')(app)

app.listen(port, function() {
	console.log('Express server listening on port', port);
});