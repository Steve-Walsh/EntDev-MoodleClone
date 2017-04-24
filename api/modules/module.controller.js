var Module = require('./module.model');
var Section = require('./../section/section.model');
var mongoose = require('mongoose');
var jwt = require('jwt-simple');
var config = require('./../../config/database')



function handleError(res, err) {
    return res.status(500).json(err);
}

// Get list of user
exports.index = function(req, res) {
    var token = req.headers.authorization.substring(11)
    var decoded = jwt.decode(token, config.secret);
    // 
    console.log("details are ", decoded)
    if (decoded.role == 'lecture') {
        Module.find({ lecture: decoded._id }).populate('sections.sectionDetails').lean().exec(function(err, modules) {
            if (err) {
                return handleError(res, err);
            }
            return res.json(200, modules);
        });
    } else {
        Module.find({ "students": decoded._id }).populate('sections.sectionDetails').lean().exec(function(err, modules) {
            if (err) {
                console.log(err)
                return handleError(res, err);
            }
            return res.json(200, modules);
        });
    }
};

// Creates a new user in datastore.
exports.create = function(req, res) {
    console.log("create function", req.body)
    console.log(req.body)
    var module = {
        name: req.body.name,
        lecture: req.body.lecture,
        sections: [],
        students: [],
        lecture_help: [],
        hidden: req.body.private
    };
    Module.create(module, function(err, module) {
        if (err) {
            console.log(err)
            return handleError(res, err);
        }

        return res.json(201, module);
    })
};


// Update an existing user in datastore.
exports.update = function(req, res) {
    Module.findById(req.params.id, function(err, user) {
        module.name = req.body.name
        module.address = req.body.address
        module.phone_number = req.body.phone_number
        module.save(function(err) {
            if (err) {
                return handleError(res, err);
            }
            return res.send(200, 'Update successful');
        });
    });
}

// Deletes a user from datastore.
exports.destroy = function(req, res) {
    console.log(req.params.id)
    Module.remove({ _id: req.params.id }, function(err) {
        if (err) {
            return handleError(res, err);
        }
    })
};


exports.getModule = function(req, res) {
    Module.findOne({ _id: req.params.id }).populate('sections.sectionDetails').lean().exec(function(err, docs) {
        if (err) {
            return handleError(docs, err);
        }
        return res.status(200).json(docs)
    })
}

getSection = function(input) {
    console.log("getsection", input)
    Section.findOne({ _id: input })
        .populate('sections.sectionId')
        .exec(function(err, docs) {
            if (err) {
                return handleError(docs, err);
            }
            return docs
        })
}



exports.addSection = function(req, res) {
    var module
    var sectionId
    var filesList = []
    if (req.body.files != null) {
        filesList = req.body.files
    }
    Module.findOne({ _id: req.body.moduleId }, function(err, resModule) {
        if (err) {
            return handleError(res, err);
        }
        module = resModule
    }).then(function(res) {
        var newSection = {
            name: req.body.name,
            info: req.body.info,
            files: filesList,
            linked: true
        };
        Section.create(newSection, function(err, resSection) {
            if (err) {
                console.log(err)
                return handleError(res, err);
            } else {
                sectionId = resSection._id
            }
        }).then(function(argument) {
            Module.findOneAndUpdate({ _id: req.body.moduleId }, {
                    $push: {
                        sections: {
                            sectionDetails: sectionId,
                            locNum: module.sections.length,
                            hidden: req.body.hidden
                        }
                    }
                }, { safe: true, upsert: true },
                function(err) {
                    if (err) {
                        return handleError(res, err);
                    }
                    return 'Update successful'
                });
        })
    })
};


exports.getMyModules = function(req, res) {
    Module.find({ lecture: req.params.id }).populate('sections.sectionDetails').lean().exec(function(err, docs) {
        if (err) {
            console.log(err)
            return handleError(docs, err);
        }
        return res.status(200).json(docs)
    })

}


exports.importSections = function(req, res) {
    var sections = req.body.section;
    var module
    sections.forEach(function(section) {
        Module.findOne({ _id: req.body.moduleId }, function(err, resModule) {
            if (err) {
                return handleError(res, err);
            }
            module = resModule
        }).then(function() {


            Module.findOneAndUpdate({ _id: req.body.moduleId }, {
                    $push: {
                        sections: {
                            sectionDetails: section.id,
                            locNum: module.sections.length,
                            hidden: section.hidden
                        }
                    }
                }, { safe: true, upsert: true },
                function(err) {
                    if (err) {
                        return handleError(res, err);
                    }
                });
        })
        return res.status(200)
    })
}


exports.unlinkSection = function(req, res) {
    var newSectionId;
    var newSection
    var count = 0
    Module.find({ lecture: req.body.lecture_id }).populate('sections.sectionDetails').lean().exec(function(err, module) {
        console.log(module.length)
        for (var i = 0; i < module.length; i++) {
            var item = module[i]

            for (var x = 0; x < item.sections.length; x++) {
                if (item.sections[x].sectionDetails._id == req.body.id) {
                    count++
                    if (count == 1) {
                        newSection = {
                            name: item.sections[x].sectionDetails.name,
                            files: item.sections[x].sectionDetails.files,
                            info: item.sections[x].sectionDetails.info,
                            linked: item.sections[x].sectionDetails.linked
                        }
                    }
                }
            }

        }
    }).then(function() {
        if (count > 1) {
            Section.create(newSection, function(err, resNewSection) {
                if (err) { handleError(res, err) } else {
                    newSectionId = resNewSection._id
                }
            }).then(function() {
                Module.findOneAndUpdate({ _id: req.body.module_id, "sections.sectionDetails": req.body.id }, {
                        $set: {
                            "sections.$.sectionDetails": newSectionId
                        }
                    }, { safe: true, upsert: true },
                    function(err, output) {
                        if (err) {
                            console.log(err)
                            return handleError(res, err);
                        }
                        console.log(output)
                    });
            })

        }
    })

}


exports.showSection = function(req, res) {
    Module.findOneAndUpdate({ _id: req.body.moduleId, "sections._id": req.body.sectionId, "sections.hidden": true }, {
            $set: {
                "sections.$.hidden": false
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


exports.hideSection = function(req, res) {
    Module.findOneAndUpdate({ _id: req.body.moduleId, "sections._id": req.body.sectionId, "sections.hidden": false }, {
            $set: {
                "sections.$.hidden": true
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


exports.enrollStudent = function(req, res) {
    Module.findOneAndUpdate({ _id: req.body.moduleId }, { $push: { students: req.body.studentId } }, { safe: true, upsert: true },
        function(err, output) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json("update successful")
        });
}


exports.removeStudent = function(req, res) {
    Module.findOneAndUpdate({ _id: req.body.moduleId }, { $pull: { students: req.body.studentId } }, { safe: true, upsert: true },
        function(err, output) {
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json("update successful")
        });
}


exports.removeSection = function(req, res) {
    console.log("req.body", req.body)

    Module.findOneAndUpdate({ _id: req.body.moduleId }, { $pull: { sections: { _id: mongoose.Types.ObjectId(req.body.sectionId) } } }, { safe: true, upsert: true },
        function(err, output) {
            console.log("output", output)
            console.log("err", err)
            if (err) {
                return handleError(res, err);
            }
            return res.status(200).json("update successful")
        });

}

exports.deleteModule = function(req, res){

    Module.remove({_id : req.body.id}, function(err, output){
        console.log(err)
        if(err){
            handleError(res, err)
        }else{
            return res.status(200).json("module deleted")
        }
    })
}
