const mongoose = require('mongoose');
const config = require('./../config/database');
const autoIncrement = require('mongoose-auto-increment');

const connection = mongoose.createConnection(config.database);

autoIncrement.initialize(connection);



const userSchema = mongoose.Schema({
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	phone_number: {
		type: String,
		required: true
	},
	role: {
		type: Number,
		required: true
	},
	chain: {
		type: Number,
	},
	index:  {
		type: Number
	},
	sdd_coin_address : {
		type: String
	},
	ether_address : {
		type: String
	},
	recommender_id : {
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
userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'index' });
let User = module.exports = mongoose.model('User', userSchema);