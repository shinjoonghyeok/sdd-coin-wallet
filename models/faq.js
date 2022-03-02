const mongoose = require('mongoose');
const config = require('./../config/database');
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);

const faqSchema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	content: {
		type: String,
		required: true
	},
	writer: {
		type: String,
		required: true
	},
	language: {
		type: String,
		required: true
	},
	index:  {
		type: Number
	},
	delete:  {
		type: Boolean,
		default: false
	},
	reg_date : {
		type: Date,
		default: Date.now
	},
	update_date : {
		type: Date,
		default: Date.now
	}
})

// Role Admin = 1 User = 0
faqSchema.plugin(autoIncrement.plugin, { model: 'Faq', field: 'index' });
let Faq = module.exports = mongoose.model('Faq', faqSchema);