var mongoose  = require('mongoose')
var Schema    = mongoose.Schema;
mongoose.Promise = global.Promise;


// var Section = require("./../section/section.model");



var UserSchema = new Schema({
    userId: { type: String, required: true }
});



var ModSectionSchema = new Schema({
	sectionDetails: { type: mongoose.Schema.Types.ObjectId, ref: "section" ,required: true },
	locNum:    		{ type: String, required: true },
	hidden:   		{ type: Boolean, required: true }
});



var ModuleSchema = new Schema({
	name:     { type: String, required: true } ,
	lecture:  { type: String, required: true } ,
	sections: [ModSectionSchema],
	students: [{ type: String, required: true }],
	hidden :  { type : Boolean, required : true}
});


module.exports = mongoose.model('module', ModuleSchema);

