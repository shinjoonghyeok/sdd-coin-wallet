const mongoose = require('mongoose');
const config = require('./../config/database');
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);



const walletSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	sdd_coin_address : {
		type: String
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
let Wallet = module.exports = mongoose.model('Wallet', walletSchema);