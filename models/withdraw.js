const mongoose = require('mongoose')
				 require('mongoose-double')(mongoose);;
const config = require('./../config/database');
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);

var SchemaTypes = mongoose.Schema.Types;
const withdrawSchema = mongoose.Schema({
	withdrawer: {
		type: String,
		required: true
	},
	from: {
		type: String,
		required: true
	},
	to: {
		type: String,
		required: true
	},
	withdraw_type: {
		type: String,
		required: true
	},
	withdraw_amount: {
		type: SchemaTypes.Double,
		required: true
	},
	gas_limit: {
		type: SchemaTypes.Double,
		required: true
	},
	gas_price: {
		type: SchemaTypes.Double,
		required: true
	},
	now_ether_balance: {
		type: SchemaTypes.Double,
		required: true
	},
	now_token_balance: {
		type: SchemaTypes.Double,
		required: true
	},
	withdraw_success: {
		type: Boolean,
		required: true
	},
	withdraw_result: {
		type: String,
		required: true
	},
	withdraw_txhash: {
		type: String
	},
	reg_date : {
		type: Date,
		default: Date.now
	}
})

// Role Admin = 1 User = 0
let Withdraw = module.exports = mongoose.model('Withdraw', withdrawSchema);