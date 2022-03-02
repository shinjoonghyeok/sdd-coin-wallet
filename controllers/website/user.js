const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const axios = require('axios');
const nodemailer = require( 'nodemailer' );
const randomstring = require("randomstring");

const apiConfig = require('./../../config/etheraip');

const User = require('./../../models/user');
const Wallet = require('./../../models/wallet');
/**
* GET /
* Login page.
*/
exports.getLogin = (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect(303, '/')
	} else {
		res.render('website/login', {
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
		successRedirect: '/',
		failureRedirect: '/login',
		badRequestMessage: 'Please fill the form',
		failureFlash: true
	})(req, res, next);
};


/**
* GET /
* Login page.
*/
exports.getRegister = (req, res, next) => {
	if (req.isAuthenticated()) {
		res.redirect(303, '/')
	} else {
		res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: ''
		});
	}
};

exports.postRegister = async (req, res, next) => {
	const email = req.body.email;
	const phone_number = req.body.phone_number;
	const password = req.body.password;
	const confirm_password = req.body.confirm_password;

	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('phone_number', 'Phone Number is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password', 'Password should be combination of at least one letter, one special char, one digit and min 8 char long').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
	req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if (errors) {
		return res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: errors,
			user: ''
		});
	}

	let isEmailRegistered = await User.findOne({
		email: req.body.email
	})

	let isPhoneRegistered = await User.findOne({
		phone_number: req.body.phone_number
	})

	if (isEmailRegistered) {
		let errors = [{
			param: 'email',
			msg: 'Email is already taken',
			value: ''
		}]

		return res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: errors,
			user: ''
		});
	} 
	else if (isPhoneRegistered) {
		let errors = [{
			param: 'phone_number',
			msg: 'Phone Number is already taken',
			value: ''
		}]

		return res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: errors,
			user: ''
		});
	} 
	else if (isEmailRegistered && isPhoneRegistered) {
		let errors = [{
			param: 'email',
			msg: 'Email is already taken',
			value: ''
		}, {
			param: 'phone_number',
			msg: 'Phone Number is already taken',
			value: ''
		}]

		return res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: errors,
			user: ''
		});
	}

	let newUser = new User({
		email: email,
		phone_number: phone_number,
		password: password,
		role: 0,
		chain: 10,
		sdd_coin_address: ''
	});

	bcrypt.genSalt(10, (err, salt) => {
		bcrypt.hash(newUser.password, salt, (err, hash) => {
			if (err) {
				console.log(err);
			}
			newUser.password = hash;
			newUser.save((err) => {
				if (err) {
					console.log(err);
					return;
				} else {
					saveCoinAddress(email);
					req.flash('success', 'You are now registered and can log in');
					res.redirect('/login');
				}
			});
		});
	});
}

/**
* POST /
* Check email.
*/
exports.checkEmail = async (req, res, next) => {
	let isEmailRegistered = await User.findOne({
		email: req.query.email
	})

	if (isEmailRegistered) {
		console.log(isEmailRegistered);
		res.status(200).json({
			status: 'error',
			message: 'Email Address is already registered.'
		})
	} else {
		console.log(isEmailRegistered);
		res.status(200).json({
			status: 'success',
			message: 'Email Address is available.'
		})
	}
};

/**
* POST /
* Check phone numer.
*/
exports.checkPhone = async (req, res, next) => {
	let isPhoneRegistered = await User.findOne({
		email: req.query.phone_number
	})

	if (isPhoneRegistered) {
		res.status(409).json({
			status: 'error',
			message: 'Phone Number is already registered.'
		})
	}
	else {
		res.status(200).json({
			status: 'success',
			message: 'Phone Number is available.'
		})
	}
};


/**
* GET /
* Account page.
*/
exports.getAccount = async (req, res, next) => {
	let account =  await User.findOne({
		email: req.user.email
	})
	
	let is_wallet = false;
	
	let wallet = await Wallet.findOne({
		email: req.user.email
	});
	
	if(wallet) is_wallet = true;
	
	let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${req.user.sdd_coin_address}`);
	let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${req.user.sdd_coin_address}`);
	let etherDecimal = ethereumBalance.data.balnace / Math.pow(10,18);
	let tokenDecimal = tokenBalance.data.balnace / Math.pow(10,8);


	if(account) {
		res.render('website/account', {
			page_name: 'account',
			page_title: 'Account',
			account: account,
			ethereumBalance: etherDecimal,
			tokenBalance: tokenDecimal,
			is_wallet: is_wallet,
			errors: '',
			success: ''
		});
	}
	
};


/**
* POST /
* Account page.
*/
exports.postAccount = async (req, res, next) => {
	let account =  await User.findOne({
		email: req.user.email
	});
	let wallet = await Wallet.findOne({
		email: req.user.email
	});
	let is_wallet = false;
	var nowDate = new Date();
	
	if(wallet) is_wallet = true;
	
	let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${req.user.sdd_coin_address}`);
	let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${req.user.sdd_coin_address}`);
	let etherDecimal = ethereumBalance.data.balnace / Math.pow(10,18);
	let tokenDecimal = tokenBalance.data.balnace / Math.pow(10,8);
	
	const old_password = req.body.old_password;
	const new_password = req.body.new_password;
	const new_password_check = req.body.new_password_check;

	req.checkBody('old_password', 'Old Password is required').notEmpty();
	req.checkBody('new_password', 'New Password is required').notEmpty();
	req.checkBody('new_password_check', 'New Password Check is required').notEmpty();

	req.checkBody('new_password', 'Password should be combination of at least one letter, one special char, one digit and min 8 char long').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
	req.checkBody('new_password_check', 'Passwords do not match').equals(req.body.new_password);

	let errors = req.validationErrors();

	if (errors) {
		return res.render('website/account', {
			page_name: 'account',
			page_title: 'Account',
			account: account,
			ethereumBalance: etherDecimal,
			tokenBalance: tokenDecimal,
			is_wallet: is_wallet,
			errors: errors,
			success: '',
			user: req.user
		});
	}
	
	if(req.body.chg_type=="login") {
		if(account) {
			let chk_passwd = bcrypt.compareSync(old_password, account.password);
			if(!chk_passwd) {
				let errors = [{
					param: 'old_password',
					msg: 'Old Password do not Match',
					value: ''
				}]

				return res.render('website/account', {
					page_name: 'account',
					page_title: 'Account',
					account: account,
					ethereumBalance: etherDecimal,
					tokenBalance: tokenDecimal,
					is_wallet: is_wallet,
					errors: errors,
					success: '',
					user: req.user
				});
			}
			//qQvO2F18

			let new_salt = await bcrypt.genSaltSync(10);
			let new_hash = await bcrypt.hashSync(new_password, new_salt);

			User.update({ email: account.email }, { $set: { password: new_hash, update_date: nowDate }}, function(err){
				if(err) {
					console.log(err);
					let errors = [{
						param: 'email',
						msg: 'Password Change Error',
						value: ''
					}]

					return res.render('website/account', {
						page_name: 'account',
						page_title: 'Account',
						account: account,
						ethereumBalance: etherDecimal,
						tokenBalance: tokenDecimal,
						is_wallet: is_wallet,
						errors: errors,
						success: '',
						user: req.user
					});
				}
			});

			let success = [{
				param: '',
				msg: 'Password change Success.',
				value: ''
			}]

			res.render('website/account', {
				page_name: 'account',
				page_title: 'Account',
				account: account,
				ethereumBalance: etherDecimal,
				tokenBalance: tokenDecimal,
				is_wallet: is_wallet,
				errors: '',
				success: success,
				user: req.user
			});
		}
		else {
			res.redirect('/logout');
		}
	}
	else if(req.body.chg_type=="withdraw") {
		let chk_passwd = bcrypt.compareSync(old_password, wallet.password);
		if(!chk_passwd) {
			let errors = [{
				param: 'old_password',
				msg: 'Old Password do not Match',
				value: ''
			}]

			return res.render('website/account', {
				page_name: 'account',
				page_title: 'Account',
				account: account,
				ethereumBalance: etherDecimal,
				tokenBalance: tokenDecimal,
				is_wallet: is_wallet,
				errors: errors,
				success: '',
				user: req.user
			});
		}
		
		
		let new_salt = await bcrypt.genSaltSync(10);
		let new_hash = await bcrypt.hashSync(new_password, new_salt);

		Wallet.update({ email: account.email }, { $set: { password: new_hash, update_date: nowDate }}, function(err){
			if(err) {
				console.log(err);
				let errors = [{
					param: 'email',
					msg: 'Password Change Error',
					value: ''
				}]

				return res.render('website/account', {
					page_name: 'account',
					page_title: 'Account',
					account: account,
					ethereumBalance: etherDecimal,
					tokenBalance: tokenDecimal,
					is_wallet: is_wallet,
					errors: errors,
					success: '',
					user: req.user
				});
			}
		});

		let success = [{
			param: '',
			msg: 'Password change Success.',
			value: ''
		}]

		res.render('website/account', {
			page_name: 'account',
			page_title: 'Account',
			account: account,
			ethereumBalance: etherDecimal,
			tokenBalance: tokenDecimal,
			is_wallet: is_wallet,
			errors: '',
			success: success,
			user: req.user
		});
	}
	else {
		res.redirect('/logout');
	}
};


/**
* GET /
* forgot page.
*/
exports.getForgot = (req, res, next) => {
	res.render('website/forgot-password', {
		page_name: 'forgot-password',
		page_title: 'Forgot Password',
		errors: ''
	});
};

/**
* POST /
* forgot page.
*/
exports.postForgot = async (req, res, next) => {
	const emailAddress = req.body.emailAddress;
	var nowDate = new Date();

	req.checkBody('emailAddress', 'Email is required').notEmpty();
	req.checkBody('emailAddress', 'Email is not valid').isEmail();
	let errors = req.validationErrors();

	if (errors) {
		return res.render('website/forgot-password', {
			page_name: 'forgot-password',
			page_title: 'Forgot Password',
			errors: errors,
			user: ''
		});
	}
	
	let isEmailRegistered = await User.findOne({
		email: emailAddress
	})

	if (!isEmailRegistered) {
		let errors = [{
			param: 'email',
			msg: 'Email is not Registered',
			value: ''
		}]

		return res.render('website/register', {
			page_name: 'register',
			page_title: 'Register',
			errors: errors,
			user: ''
		});
	} 
	
	let temp_password = randomstring.generate(8);
	
	let temp_salt = await bcrypt.genSaltSync(10);
	let temp_hash = await bcrypt.hashSync(temp_password, temp_salt);
	
	
	User.update({ email: emailAddress }, { $set: { password: temp_hash, update_date: nowDate }}, function(err){
		if(err) {
			console.log(err);
			let errors = [{
				param: 'email',
				msg: 'Temp Email Error',
				value: ''
			}]

			return res.render('website/forgot-password', {
				page_name: 'forgot-password',
				page_title: 'Forgot Password',
				errors: errors,
				user: ''
			});
		}
	});

	const output = `
		<p>You have a new message from SDD website Temporary Password</p>
		<br /><br />
		<p>Temporary Password : <span style="font-weight:bold;">${temp_password}</span></p>
	`;

	// create reusable transporter object using the default SMTP transport
	let transporter = nodemailer.createTransport( {
		service: 'gmail',
		auth: {
			user: 'derbyholdem@gmail.com',
			pass: 'deho9435'
		}	
	});

	// setup email data with unicode symbols
	let mailOptions = {
		from: `SDD Tech website form <derbyholdem@gmail.com>`, // sender address
		to: emailAddress, // list of receivers
		subject: 'Forgot Password', // Subject line
		text: temp_password, // plaintext body
		html: output
	};

	// send mail with defined transport object
	transporter.sendMail( mailOptions, ( error, info ) => {
		if ( error ) {
			return console.log( error );
		}
		console.log( 'Message sent: %s', info.messageId );
		console.log( 'Preview URL: %s', nodemailer.getTestMessageUrl( info ) );
	});
	
	req.flash('success', 'Temparary Password Send');
	res.redirect(303, '/login')
};



async function saveCoinAddress(emailAddress) {
	let account = await User.findOne({
		email: emailAddress
	})
	if (account) {
		try {
			//let ethereumAddress = await axios.get(`http://54.255.186.237:3000/address/${account.chain}/${account.index}`);
			let ethereumAddress = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/address/${account.chain}/${account.index}`);
			User.update({ email: emailAddress }, { $set: { sdd_coin_address: ethereumAddress.data.address }}, function(err){
				if(err){
					console.log(err);
					return;
				} 
			});
		} catch (error) {
			console.error(error);
		}
	}
}