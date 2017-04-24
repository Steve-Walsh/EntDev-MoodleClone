var mongoose = require('mongoose')
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

var fileSchema = new Schema({
	orgName:    { type: String, required: true },
	location: 	{ type: String, required: true },
	newName: 	{ type: String, required: true },
	mimetype: 	{ type: String, required: true },
	hidden:   	{ type: Boolean, required: true },
	type: 		{ type: String, required: true}
});


var SectionSchema = new Schema({
	name:     { type: String, required: true },
	info:     { type: String, required: true },
	files:    [fileSchema],
	linked:   { type: Boolean, required: true }
	
});

module.exports = mongoose.model('section', SectionSchema);


