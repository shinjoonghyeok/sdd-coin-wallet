const axios = require('axios');
const bcrypt = require('bcryptjs');

const Admin = require('./../../models/admin');
const User = require('./../../models/user');
const apiConfig = require('./../../config/etheraip');

/**
* GET /
* Investors page.
*/
exports.getInvestor = async ( req, res, next ) => {
	let adminAddr =  await Admin.findOne({
		admin_config: 'ether_addr'
	})
	
	let admin_addr = null;
	let is_addr = null;
	let member_addr = null;
	let is_logged = null;
	let ether_addr = null;
	let recommender_id = null;
	
	if(adminAddr) {
		is_addr = true,
		admin_addr = adminAddr.config_content;
	}
	else {
		is_addr = false,
		admin_addr = 'Request Address to Administrator.'
	}
	
	if (typeof req.user != 'undefined') {
		is_logged = true;
		member_addr = req.user.sdd_coin_address;
		
		if(typeof req.user.ether_address != 'undefined') ether_addr = req.user.ether_address;
		else ether_addr = 'Not Set';
		
		if(typeof req.user.recommender_id != 'undefined') recommender_id = req.user.recommender_id;
	}
	else {
		is_logged = false;
		member_addr = '';
		ether_addr = '';
	}
	
	res.render( 'website/investor', {
		page_name: 'investor',
		page_title: 'Investor',
		admin_addr: admin_addr,
		is_addr: is_addr,
		member_addr: member_addr,
		recommender_id: recommender_id,
		is_logged: is_logged,
		ether_addr: ether_addr,
		errors: '',
		success: ''
	});
};

exports.postRecommender = async ( req, res, next ) => {
	let sdd_coin_address = req.user.sdd_coin_address;
	let recommender_id = req.body.recommender_id;
	
	if (typeof req.user == 'undefined') {
		req.flash('error', 'Login is required.');
		res.redirect('/investor');
	}
	else {
		let updateDB = await User.update({ email: req.user.email }, { $set: { recommender_id: recommender_id }}, function(err){
			console.log("db update");
			if(err) {
				console.log(err);
				req.flash('error', 'Insert Error.');
				res.redirect('/investor');
			} else {
				req.flash('success', 'Recommender ID Saved.');
				res.redirect('/investor');
			}
		});
	}
	
	
};

exports.postInvestor = async ( req, res, next ) => {
	let adminAddr =  await Admin.findOne({
		admin_config: 'ether_addr'
	})
	
	let admin_addr = null;
	let is_addr = null;
	let member_addr = null;
	let is_logged = null;
	let ether_addr = null;
	
	if(adminAddr) {
		is_addr = true,
		admin_addr = adminAddr.config_content;
	}
	else {
		is_addr = false,
		admin_addr = 'Request Address to Administrator.'
	}
	
	if (typeof req.user != 'undefined') {
		is_logged = true;
		member_addr = req.user.sdd_coin_address;
		
		if(typeof req.user.ether_address != 'undefined') ether_addr = req.user.ether_address;
		else ether_addr = 'Not Set';
	}
	else {
		is_logged = false;
		member_addr = '';
		ether_addr = '';
	}
	
	if (typeof req.user == 'undefined') {
		let errors = [{
			param: 'ether_addr',
			msg: 'Please Login first',
			value: ''
		}];
		
		return res.render( 'website/investor', {
			page_name: 'investor',
			page_title: 'Investor',
			admin_addr: admin_addr,
			is_addr: is_addr,
			member_addr: member_addr,
			is_logged: is_logged,
			ether_addr: ether_addr,
			errors: errors,
			success: '',
			user: ''
		});
	}
	
	const etherAddr = req.body.ether_addr;
	const userPasswd = req.body.user_password;
	
	req.checkBody('ether_addr', 'Ethereum Address is required').notEmpty();
	req.checkBody('user_password', 'User Password is required').notEmpty();
	
	let errors = req.validationErrors();

	if (errors) {
		return res.render( 'website/investor', {
			page_name: 'investor',
			page_title: 'Investor',
			admin_addr: admin_addr,
			is_addr: is_addr,
			member_addr: member_addr,
			is_logged: is_logged,
			ether_addr: ether_addr,
			errors: errors,
			success: '',
			user: ''
		});
	}
	
	let chk_passwd = bcrypt.compareSync(userPasswd, req.user.password);
	if(!chk_passwd) {
		let errors = [{
			param: 'user_password',
			msg: 'User Password do not Match',
			value: ''
		}]

		return res.render( 'website/investor', {
			page_name: 'investor',
			page_title: 'Investor',
			admin_addr: admin_addr,
			is_addr: is_addr,
			member_addr: member_addr,
			is_logged: is_logged,
			ether_addr: ether_addr,
			errors: errors,
			success: '',
			user: ''
		});
	}
	
	let checkAddress = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/checkAddress/${etherAddr}`);
	if(!checkAddress.data.Result) {
		let errors = [{
			param: '',
			msg: 'Ethereum Address is Wrong',
			value: ''
		}]

		return res.render( 'website/investor', {
			page_name: 'investor',
			page_title: 'Investor',
			admin_addr: admin_addr,
			is_addr: is_addr,
			member_addr: member_addr,
			is_logged: is_logged,
			ether_addr: ether_addr,
			errors: errors,
			success: '',
			user: ''
		});
	}
	
	
	let updateDB = await User.update({ email: req.user.email }, { $set: { ether_address: etherAddr }}, function(err){
		console.log("db update");
		if(err) {
			console.log(err);
			let errors = [{
				param: 'ether_addr',
				msg: 'Ether Address update fail.',
				value: ''
			}]

			return res.render( 'website/investor', {
				page_name: 'investor',
				page_title: 'Investor',
				admin_addr: admin_addr,
				is_addr: is_addr,
				member_addr: member_addr,
				is_logged: is_logged,
				ether_addr: ether_addr,
				errors: errors,
				success: '',
				user: req.user
			});
		} else {
			res.redirect('/investor');
		}
	});
	
};


async function strMod(ori,i,ch){
	return ori.substring(0,i) + ch + ori.substring(i+ch.length,ori.length);
}




