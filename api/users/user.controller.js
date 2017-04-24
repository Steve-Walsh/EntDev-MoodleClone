var User = require('./user.model');
var jwt = require('jwt-simple');

function handleError(res, err) {
    return res.send(500, err);
}

// Get list of user
exports.index = function(req, res) {
    User.find(function(err, users) {
        if (err) {
            return handleError(res, err); }
        return res.json(200, users);
    });
};

// Get list of user
exports.getStudents = function(req, res) {
    User.find({ role: "student" }, function(err, users) {
        if (err) {
            return handleError(res, err); }
        return res.status(200).json(users);
    });
};



// Creates a new user in datastore.
exports.create = function(req, res) {
    console.log(req.body);
    if (!req.body.email || !req.body.password) {
        res.json({ success: false, msg: 'Please pass name and password.' });
    } else {
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            email: req.body.email,
            role: req.body.role
        });
        // save the user
        console.log(newUser)
        newUser.save(function(err) {
            if (err) {
                console.log("error : ", err)
                return res.json({ success: false, msg: 'Username already exists.' });
            }
            res.json({ success: true, msg: 'Successful created new user.' });
        });
    }
};

exports.login = function(req, res) {
    console.log("inside")
    console.log(req.body);

    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
          return handleError(res, err); 
        }
        if (!user) {
            res.send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function(err, isMatch) {
                if (isMatch && !err) {
                  consolelog(user)
                    // if user is found and password is right create a token
                    var token = jwt.encode(user, config.secret);
                    // return the information including token as JSON
                    console.log("token : ", token)
                    res.json({ success: true, token: 'JWT ' + token });
                } else {
                    res.send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            });
        }
    })


};
