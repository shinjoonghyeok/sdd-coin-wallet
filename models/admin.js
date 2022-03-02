const mongoose = require('mongoose');
const config = require('./../config/database');
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);

const adminSchema = mongoose.Schema({
	admin_config: {
		type: String,
		required: true
	},
	config_content: {
		type: String,
		required: true
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
let Admin = module.exports = mongoose.model('Admin', adminSchema);