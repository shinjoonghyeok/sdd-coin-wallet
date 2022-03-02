const passport = require('passport');
const axios = require('axios');
const bcrypt = require('bcryptjs');

const Admin = require('./../../models/admin');
const apiConfig = require('./../../config/etheraip');

/**
* GET /
* Login page.
*/
exports.getLogin = (req, res, next) => {

if (req.isAuthenticated() && req.user.role === 1) {
	res.redirect(303, '/admin/member-admin')
	} else {
		res.render('admin/index', {
			page_name: 'login',
			page_title: 'Login'
		});
	}
};

/**
* POST /
* Login page.
*/
exports.postLogin = (req, res, next) => {
	passport.authenticate('local', {
		successRedirect: '/admin/member-admin',
		failureRedirect: '/admin',
		badRequestMessage: 'Please fill the form',
		failureFlash: true
	})(req, res, next);
};



/**
* GET /
* Admin page.
*/
exports.getAccount = async (req, res, next) => {
	let adminAddr =  await Admin.findOne({
		admin_config: 'ether_addr'
	});
	
	if(adminAddr) {
		let ethereumBalance = 0;
		let tokenBalance = 0;
		
		let checkAddress = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/checkAddress/${adminAddr.config_content}`);
		
		if(checkAddress.data.Result) {
			res.render('admin/account', {
				page_name: 'account',
				page_title: 'Account',
				is_account: true,
				account: adminAddr,
				errors: '',
				success: ''
			});
		}
		else {
			let errors = [{
				param: '',
				msg: 'Admin Address is Wrong',
				value: ''
			}]

			res.render('admin/account', {
				page_name: 'account',
				page_title: 'Account',
				is_account: true,
				account: adminAddr,
				errors: errors,
				success: '',
				user: req.user
			});
		}
	}
	else {
		res.render('admin/account', {
			page_name: 'account',
			page_title: 'Account',
			is_account: false,
			account: adminAddr,
			errors: '',
			success: ''
		});
	}
};



/**
* GET /
* Admin page.
*/
exports.postAccount = async (req, res, next) => {
	let adminAddr =  await Admin.findOne({
		admin_config: 'ether_addr'
	});
	let is_account = false;
	
	if(adminAddr) is_account = true;
	
	if(req.user.role == 1) {
		const companyAddress = req.body.companyAddress;
		const adminPassword = req.body.companyPasswd;
		
		
		//Check Require Filed
		req.checkBody('companyAddress', 'Ethereum Address is required').notEmpty();
		req.checkBody('companyPasswd', 'Admin Password is required').notEmpty();
		let errors = req.validationErrors();

		if (errors) {
			return res.render('admin/account', {
				page_name: 'account',
				page_title: 'Account',
				is_account: is_account,
				account: '',
				errors: errors,
				success: '',
				user: req.user
			});
		}
		
		//Check Password
		let chk_passwd = bcrypt.compareSync(adminPassword, req.user.password);
		if(!chk_passwd) {
			let errors = [{
				param: 'companyPasswd',
				msg: 'Admin Password do not Match',
				value: ''
			}]

			return res.render('admin/account', {
				page_name: 'account',
				page_title: 'Account',
				is_account: is_account,
				account: adminAddr,
				errors: errors,
				success: '',
				user: req.user
			});
		}
		
		//Check Address
		let checkAddress = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/checkAddress/${companyAddress}`);
		if(!checkAddress.data.Result) {
			let errors = [{
				param: '',
				msg: 'Admin Address is Wrong',
				value: ''
			}]

			return res.render('admin/account', {
				page_name: 'account',
				page_title: 'Account',
				is_account: is_account,
				account: adminAddr,
				errors: errors,
				success: '',
				user: req.user
			});
		}
		
		
		//Update Start
		if(adminAddr) {
			var nowDate = new Date();
			Admin.update({ admin_config: 'ether_addr' }, { $set: { config_content: companyAddress, update_date: nowDate }}, function(err){
				if(err) {
					console.log(err);
					let errors = [{
						param: 'companyAddress',
						msg: 'Address update Error',
						value: ''
					}]

					return res.render('admin/account', {
						page_name: 'account',
						page_title: 'Account',
						is_account: is_account,
						account: adminAddr,
						errors: errors,
						success: '',
						user: req.user
					});
				} else {
					res.redirect('/admin/account');
				}
			});
		}
		else {
			let newAddress = new Admin({
				admin_config: 'ether_addr',
				config_content: companyAddress
			});
			newAddress.save((err) => {
				if (err) {
					console.log(err);
					let errors = [{
						param: 'companyAddress',
						msg: 'Address regist Error',
						value: ''
					}]

					return res.render('admin/account', {
						page_name: 'account',
						page_title: 'Account',
						is_account: companyAddress,
						account: adminAddr,
						errors: errors,
						success: '',
						user: req.user
					});
				} else {
					res.redirect('/admin/account');
				}
			});
		}
		
	}
	else {		//권한 오류
		let errors = [{
			param: 'companyAddress',
			msg: 'Admin Permission Error',
			value: ''
		}]

		return res.render('admin/account', {
			page_name: 'account',
			page_title: 'Account',
			is_account: companyAddress,
			account: '',
			errors: errors,
			success: '',
			user: req.user
		});
	}
};


