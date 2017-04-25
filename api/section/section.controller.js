var Section = require('./section.model');
var multer = require('multer')


function handleError(res, err) {
    return res.status(500).json(err);
}

// Get list of user
exports.index = function(req, res) {
    Section.find(function(err, section) {
        if (err) {
            return handleError(res, err);
        }
        return res.json(200, section);
    });
};

// Creates a new user in datastore.
exports.create = function(req, res) {
    console.log("create function")
    var user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role
    };
    Section.create(user, function(err, user) {
        if (err) {
            console.log(err)
            return handleError(res, err);
        }

        return res.json(201, user);
    })

};

// Update an existing user in datastore.
exports.update = function(req, res) {
    Section.findById(req.params.id, function(err, user) {
        user.name = req.body.name
        user.address = req.body.address
        user.phone_number = req.body.phone_number
        user.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(200, 'Update successful');
        });
    });
}

// Deletes a user from datastore.
exports.destroy = function(req, res) {
    Section.remove({ _id: req.params.id }, function(err) {
        if (err) {
            return handleError(res, err);
        }
    })
};

exports.uploadFile = function(req, res) {
    var type = req.file.originalname.split(".")
    type = type[type.length - 1]
    Section.findOneAndUpdate({ _id: req.body.section_id }, {
        $push: {
            files: {
                orgName: req.file.originalname,
                location: req.file.path,
                newName: req.file.filename,
                mimetype: req.file.mimetype,
                type: type,
                hidden: req.body.hidden
            }
        }
    }, { safe: true }, function(err, secRes) {
        if (err) {
            return handleError(res, err);
        }
        return res.redirect('/#/module/' + req.body.module_id)
    });

}

exports.downloadFile = function(req, res) {
    var path = require('path');
    Section.findOne({ "files._id": req.params.id }, { "files.$.": true }).exec(function(err, data) {
        if (err) {
            return handleError(res, err);
        }
        res.setHeader('Content-Type', data.files[0].mimetype);
        res.sendFile(path.resolve(__dirname + '/../../public/data/files/' + data.files[0].newName), data.files[0].orgName)
    })

}

exports.removeFile = function(req, res) {
    console.log("remove file REQ", req.body)

    Section.update({ _id: req.body.secId }, { $pull: { files: { _id: req.body.fileId } } }, { safe: true },
        function(err, data) {
            if (err) {
                console.log(err)
                return handleError(res, err);
            }
            console.log(data);
        });
}

exports.showFile = function(req, res) {
    console.log(req.body)

    Section.findOneAndUpdate({ _id: req.body.sectionId, "files._id": req.body.fileId, "files.hidden": true }, {
            $set: {
                "files.$.hidden": false
            }
        }, { upsert: true },
        function(err, output) {
            if (err) {
                console.log(err)
                return handleError(res, err);
            }
            console.log(output)
        });

}


exports.hideFile = function(req, res) {
    console.log(req.body)

    Section.findOneAndUpdate({ _id: req.body.sectionId, "files._id": req.body.fileId, "files.hidden": false }, {
            $set: {
                "files.$.hidden": true
            }
        }, { upsert: true },
        function(err, output) {
            if (err) {
                console.log(err)
                return handleError(res, err);
            }
            console.log(output)
        });
}
