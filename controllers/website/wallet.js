const bcrypt = require('bcryptjs');
const axios = require('axios');
const notifier = require('node-notifier');
const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W');
//const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W','ropsten','3000');

const moment = require('moment');

const apiConfig = require('./../../config/etheraip');

let Wallet = require('./../../models/wallet');
let Withdraw = require('./../../models/withdraw');

/**
 * GET /
 * Wallet page.
 */
exports.getWallet = async ( req, res, next ) => {
	//console.log(req.user)
	
	/**
	var balance = etherscan.account.balance('0x24Bc92BbBD2299f192Ce59DD3b2b3F232BB751e4');
	balance.then(function(balanceData){
 		console.log(balanceData);
	});
	
	var txlist = etherscan.account.txlist('0x24Bc92BbBD2299f192Ce59DD3b2b3F232BB751e4', 1, 'latest', 'desc');
	txlist.then(function(txData) {
		console.log(txData);
	})
	
	var tokenlist = etherscan.account.tokentx('0x24Bc92BbBD2299f192Ce59DD3b2b3F232BB751e4', '', 1, 'latest', 'desc');
	tokenlist.then(function(tokenData) {
		console.log(tokenData);
	})
	**/
	
	
	//let isMatch = await bcrypt.compare("smk6122$", "$2a$10$dZAC1OHh3meYj9SS2Ya.l.N2Jq8awMeg99/7nXjFhwP7oopQztGgS");
	//let isMatch = await bcrypt.compare("smk6122@", "$2a$10$DAgLE/xXsINGskOgOM5LXu.qzUKpTnTOqZYb9BAwknN2hBj2M.LDG");
	//console.log("PASSWORD : " + isMatch);
	
	
	let isMakeWalletPassword = await Wallet.findOne({
		email: req.user.email
	});
	
	console.log(isMakeWalletPassword);
	
	if(isMakeWalletPassword) {
		let gasPrice = null;
		let setGasPrice = 0;

		let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${req.user.sdd_coin_address}`);
		let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${req.user.sdd_coin_address}`);
		let etherDecimal = ethereumBalance.data.balnace / Math.pow(10,18);
		let tokenDecimal = tokenBalance.data.balnace / Math.pow(10,8);
		
		let txArray = new Array();
		let tokenArray = new Array();


		try {
			gasPrice = await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`);
		}
		catch(e) {
			console.error(e.response.status);
		}
		if(gasPrice != null) setGasPrice = ( gasPrice.data.safeLow / 10 ) + 1;
		
		res.render( 'website/wallet', {
			page_name: 'wallet',
			page_title: 'Wallet',
			is_wallet_pw: 'yes',
			sdd_coin_address: req.user.sdd_coin_address,
			ether_balance: etherDecimal,
			token_balance: tokenDecimal,
			withdraw_fee: setGasPrice,
			errors: '',
			success: '',
			txArray: txArray,
			tokenArray: tokenArray,
		});
	}
	else {
		res.render( 'website/wallet', {
			page_name: 'wallet',
			page_title: 'Wallet',
			is_wallet_pw: 'no',
			errors: '',
		});
	}
};

exports.postWalletPW = async ( req, res, next ) => {
	const password = req.body.password;
	const confirm_password = req.body.confirm_password;
	
	req.checkBody('password', 'Password is required').notEmpty();
  	req.checkBody('password', 'Password should be combination of at least one letter, one special char, one digit and min 8 char long').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i");
	req.checkBody('confirm_password', 'Passwords do not match').equals(req.body.password);
	
	let errors = req.validationErrors();

	if (errors) {
		res.render( 'website/wallet', {
			page_name: 'wallet',
			page_title: 'Wallet',
			is_wallet_pw: 'no',
			errors: errors,
			user: req.user,
			success: ''
		});
  	}
	else {
		let newWallet = new Wallet({
			email: req.user.email,
			password: password,
			sdd_coin_address: req.user.sdd_coin_address
		});

		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(newWallet.password, salt, (err, hash) => {
				if (err) {
					console.log(err);
				}
				newWallet.password = hash;
				newWallet.save((err) => {
					if (err) {
						console.log(err);
						return;
					} else {

						req.flash('success', 'Wallet Password Registerd');
						res.redirect('/wallet');
					}
				});
			});
		});
	}
};

exports.postWalletWD = async ( req, res, next ) => {
	//console.log(req.user)
	const withdraw_type = req.body.withdraw_type;
	const withdraw_target = req.body.withdraw_target;
	const withdraw_amount = req.body.withdraw_amount;
	const withdraw_fee = req.body.withdraw_fee;
	
	const password = req.body.password;
	
	req.checkBody('withdraw_type', 'Withdraw Type is required').notEmpty();
	req.checkBody('withdraw_target', 'Withdraw Address is required').notEmpty();
	req.checkBody('withdraw_amount', 'Withdraw Amount is required').notEmpty();
	req.checkBody('withdraw_fee', 'Withdraw Fee is required').notEmpty();
	
	req.checkBody('password', 'Password is required').notEmpty();
	
	let errors = req.validationErrors();
	
	let gasPrice = null;
	let setGasPrice = 0;
	
	let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${req.user.sdd_coin_address}`);
	let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${req.user.sdd_coin_address}`);
	let etherDecimal = ethereumBalance.data.balnace / Math.pow(10,18);
	let tokenDecimal = tokenBalance.data.balnace / Math.pow(10,8);
	
	let txArray = new Array();
	let tokenArray = new Array();

	try {
		gasPrice = await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`);
	}
	catch(e) {
		console.error(e.response.status);
	}
	if(gasPrice != null) setGasPrice = ( gasPrice.data.safeLow / 10 ) + 1;

	if (errors) {
		res.render( 'website/wallet', {
			page_name: 'wallet',
			page_title: 'Wallet',
			is_wallet_pw: 'yes',
			sdd_coin_address: req.user.sdd_coin_address,
			ether_balance: etherDecimal,
			token_balance: tokenDecimal,
			withdraw_fee: setGasPrice,
			errors: errors,
			success: '',
			txArray: txArray,
			tokenArray: tokenArray,
			user: req.user
		});

		//res.redirect('/wallet');
  	}
	else {
		let walletInfo = await Wallet.findOne({
			email: req.user.email
		});
		
		//let isMatch = await bcrypt.compare(password, req.user.password);
		let isMatch = await bcrypt.compare(password, walletInfo.password);
		
		console.log(req.user.password);
		console.log(walletInfo.password);
		console.log(isMatch);
		
		
		if(isMatch) {
			console.log("Withdraw Action");

			let sendParm = new Object();
			let actWithDraw = null;
			let success = null;
			let errors = null;
			let gaslimit = 21000;
				
			sendParm.from = req.user.sdd_coin_address;
			sendParm.to = withdraw_target;
			sendParm.chain = req.user.chain;
			sendParm.index =  req.user.index;

			if(withdraw_type=='ether') {
				sendParm.value = withdraw_amount;
				sendParm.gasLimit = gaslimit;
				sendParm.gasPrice = withdraw_fee * Math.pow(10,9);
				actWithDraw = await axios.post(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + '/sendEther',sendParm);
				console.log(actWithDraw.data);
				
				//if(1) {
				if(actWithDraw.data.Success) {
					notifier.notify({
						'title': 'Withdraw Success',
						'subtitle': 'Withdraw Success',
						'message': 'Withdraw Success',
						'wait': true
					});
					//res.redirect('/wallet');
					
					success = [{
						param: 'withdraw_target',
						msg: 'Withdraw Success. Please check in about 1 ~ 2 minute.',
						value: ''
					}];
				}
				else {
					errors = [{
						param: 'withdraw_target',
						msg: actWithDraw.data.Result,
						value: ''
					}]
				}
			}
			else {			//token withdraw
				gaslimit = 63000
				sendParm.value = withdraw_amount * Math.pow(10,8);
				sendParm.gasLimit = gaslimit;
				sendParm.gasPrice = withdraw_fee * Math.pow(10,9);
				
				actWithDraw = await axios.post(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + '/sendToken',sendParm);
				console.log(actWithDraw.data);
				
				//if(1) {
				if(actWithDraw.data.Success) {
					notifier.notify({
						'title': 'Withdraw Success',
						'subtitle': 'Withdraw Success',
						'message': 'Withdraw Success',
						'wait': true
					});
					//res.redirect('/wallet');
					
					success = [{
						param: 'withdraw_target',
						msg: 'Withdraw Success. Please check in about 1 ~ 2 minute.',
						value: ''
					}];
				}
				else {
					errors = [{
						param: 'withdraw_target',
						msg: actWithDraw.data.Result,
						value: ''
					}];
				}
			}
			
			
			let withdraw_success = false;
			let withdraw_result = "";
			let withdraw_txhash = "";
			
			if(actWithDraw!=null) {
				withdraw_success = actWithDraw.data.Success;
				if(actWithDraw.data.Success) {
					withdraw_result = "Success";
					withdraw_txhash = actWithDraw.data.Result;
				}
				else {
					withdraw_result = actWithDraw.data.Result;
					withdraw_txhash = "";
				}
			}
			else {
				withdraw_result = "Unknown Error";
				withdraw_txhash = "";
			}
			
			///record history
			let newWithdraw = new Withdraw({
				withdrawer: req.user.sdd_coin_address,
				from: req.user.sdd_coin_address,
				to: withdraw_target,
				withdraw_type: withdraw_type,
				withdraw_amount: parseFloat(withdraw_amount),
				gas_limit: gaslimit,
				gas_price: parseFloat(withdraw_fee),
				now_ether_balance: parseFloat(ethereumBalance.data.balnace),
				now_token_balance: parseFloat(tokenBalance.data.balnace),
				withdraw_success: withdraw_success,
				withdraw_result: withdraw_result,
				withdraw_txhash: withdraw_txhash
			});
			
			newWithdraw.save((err) => {
				if (err) {
					console.log(err);
					return;
				} else {
					if(success!=null) {
						req.flash('success', 'Withdraw Success. Please check in about 1 ~ 2 minute.');
						res.redirect('/wallet');
					}
					else {
						res.render( 'website/wallet', {
							page_name: 'wallet',
							page_title: 'Wallet',
							is_wallet_pw: 'yes',
							sdd_coin_address: req.user.sdd_coin_address,
							ether_balance: etherDecimal,
							token_balance: tokenDecimal,
							withdraw_fee: setGasPrice,
							errors: errors,
							success: success,
							txArray: txArray,
							tokenArray: tokenArray,
							user: req.user
						});
					}
				}
			});
		}
		else {
			console.log("Withdraw Password ERROR");
			
			let errors = [{
				param: 'withdraw_target',
				msg: 'Wrong Password',
				value: ''
			}]
			res.render( 'website/wallet', {
				page_name: 'wallet',
				page_title: 'Wallet',
				is_wallet_pw: 'yes',
				sdd_coin_address: req.user.sdd_coin_address,
				ether_balance: etherDecimal,
				token_balance: tokenDecimal,
				withdraw_fee: setGasPrice,
				errors: errors,
				success: '',
				txArray: txArray,
				tokenArray: tokenArray,
				user: req.user
			});
		}
		/**
		bcrypt.compare(password, req.user.password, (err, isMatch) => {
			if (err) throw err;
			if (isMatch) {
				console.log("Withdraw Action");
				
				let sendParm = new Object();
				
				sendParm.from = req.user.sdd_coin_address;
				sendParm.to = withdraw_target;
				sendParm.chain = req.user.chain;
				sendParm.index =  req.user.index;
				
				if(withdraw_type=='ether') {
					sendParm.value = withdraw_amount;
					sendParm.gasLimit = withdraw_fee;
					sendParm.gasPrice = withdraw_fee * Math.pow(10,8);
					//let actWithDraw = axios.post('http://54.255.186.237:3000/sendEther',sendParm);
					let actWithDraw = axios.post('http://52.77.234.248:3000/sendEther',sendParm);
				}
				else {
					sendParm.value = withdraw_amount * Math.pow(10,8);
					sendParm.gasLimit = 2100000;
					sendParm.gasPrice = withdraw_fee * Math.pow(10,8);
					//let actWithDraw = axios.post('http://54.255.186.237:3000/sendToken',sendParm);
					let actWithDraw = axios.post('http://52.77.234.248:3000/sendToken',sendParm);
					
					console.log(actWithDraw);
					console.log(actWithDraw.data);
				}
				
				//console.log(actWithDraw);
				
				res.redirect('/');
			} else {
				console.log("Withdraw ERROR");
				res.redirect('/faq');
			}
		});
		**/
	}
}


exports.postWalletWD_BACKUP_20190114 = async ( req, res, next ) => {
	//console.log(req.user)
	const withdraw_type = req.body.withdraw_type;
	const withdraw_target = req.body.withdraw_target;
	const withdraw_amount = req.body.withdraw_amount;
	const withdraw_fee = req.body.withdraw_fee;
	
	const password = req.body.password;
	
	req.checkBody('withdraw_type', 'Withdraw Type is required').notEmpty();
	req.checkBody('withdraw_target', 'Withdraw Address is required').notEmpty();
	req.checkBody('withdraw_amount', 'Withdraw Amount is required').notEmpty();
	req.checkBody('withdraw_fee', 'Withdraw Fee is required').notEmpty();
	
	req.checkBody('password', 'Password is required').notEmpty();
	
	let errors = req.validationErrors();
	
	let gasPrice = null;
	let setGasPrice = 0;
	
	let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${req.user.sdd_coin_address}`);
	let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${req.user.sdd_coin_address}`);
	let etherDecimal = ethereumBalance.data.balnace / Math.pow(10,18);
	let tokenDecimal = tokenBalance.data.balnace / Math.pow(10,8);
	
	let txArray = new Array();
	let tokenArray = new Array();

	try {
		gasPrice = await axios.get(`https://ethgasstation.info/json/ethgasAPI.json`);
	}
	catch(e) {
		console.error(e.response.status);
	}
	if(gasPrice != null) setGasPrice = ( gasPrice.data.safeLow / 10 ) + 1;

	if (errors) {
		res.render( 'website/wallet', {
			page_name: 'wallet',
			page_title: 'Wallet',
			is_wallet_pw: 'yes',
			sdd_coin_address: req.user.sdd_coin_address,
			ether_balance: etherDecimal,
			token_balance: tokenDecimal,
			withdraw_fee: setGasPrice,
			errors: errors,
			success: '',
			txArray: txArray,
			tokenArray: tokenArray,
			user: req.user
		});

		//res.redirect('/wallet');
  	}
	else {
		let walletInfo = await Wallet.findOne({
			email: req.user.email
		});
		
		//let isMatch = await bcrypt.compare(password, req.user.password);
		let isMatch = await bcrypt.compare(password, walletInfo.password);
		
		console.log(req.user.password);
		console.log(walletInfo.password);
		console.log(isMatch);
		
		
		isMatch = false;
		
		if(isMatch) {
			console.log("Withdraw Action");
			
			let sendParm = new Object();
			let actWithDraw = null;
			let success = null;
			let errors = null;
			let gaslimit = 21000;
				
			sendParm.from = req.user.sdd_coin_address;
			sendParm.to = withdraw_target;
			sendParm.chain = req.user.chain;
			sendParm.index =  req.user.index;

			if(withdraw_type=='ether') {
				sendParm.value = withdraw_amount;
				sendParm.gasLimit = gaslimit;
				sendParm.gasPrice = withdraw_fee * Math.pow(10,9);
				actWithDraw = await axios.post(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + '/sendEther',sendParm);
				
				console.log(actWithDraw.data);
				
				if(actWithDraw.data.Success) {
					notifier.notify({
						'title': 'Withdraw Success',
						'subtitle': 'Withdraw Success',
						'message': 'Withdraw Success',
						'wait': true
					});
					//res.redirect('/wallet');
					
					success = [{
						param: 'withdraw_target',
						msg: 'Withdraw Success. Please check in about 1 ~ 2 minute.',
						value: ''
					}];
				}
				else {
					errors = [{
						param: 'withdraw_target',
						msg: actWithDraw.data.Result,
						value: ''
					}]
				}
			}
			else {			//token withdraw
				gaslimit = 63000
				sendParm.value = withdraw_amount * Math.pow(10,8);
				sendParm.gasLimit = gaslimit;
				sendParm.gasPrice = withdraw_fee * Math.pow(10,9);
				
				actWithDraw = await axios.post(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + '/sendToken',sendParm);
				
				console.log(actWithDraw.data);
				
				if(actWithDraw.data.Success) {
					notifier.notify({
						'title': 'Withdraw Success',
						'subtitle': 'Withdraw Success',
						'message': 'Withdraw Success',
						'wait': true
					});
					//res.redirect('/wallet');
					
					success = [{
						param: 'withdraw_target',
						msg: 'Withdraw Success. Please check in about 1 ~ 2 minute.',
						value: ''
					}];
				}
				else {
					errors = [{
						param: 'withdraw_target',
						msg: actWithDraw.data.Result,
						value: ''
					}];
				}
			}
			
			
			let withdraw_success = false;
			let withdraw_result = "";
			let withdraw_txhash = "";
			
			if(actWithDraw!=null) {
				withdraw_success = actWithDraw.data.Success;
				if(actWithDraw.data.Success) {
					withdraw_result = "Success";
					withdraw_txhash = actWithDraw.data.Result;
				}
				else {
					withdraw_result = actWithDraw.data.Result;
					withdraw_txhash = "";
				}
			}
			else {
				withdraw_result = "Unknown Error";
				withdraw_txhash = "";
			}
			
			///record history
			let newWithdraw = new Withdraw({
				withdrawer: req.user.sdd_coin_address,
				from: req.user.sdd_coin_address,
				to: withdraw_target,
				withdraw_type: withdraw_type,
				withdraw_amount: parseFloat(withdraw_amount),
				gas_limit: gaslimit,
				gas_price: parseFloat(withdraw_fee),
				now_ether_balance: parseFloat(ethereumBalance.data.balnace),
				now_token_balance: parseFloat(tokenBalance.data.balnace),
				withdraw_success: withdraw_success,
				withdraw_result: withdraw_result,
				withdraw_txhash: withdraw_txhash
			});
			
			newWithdraw.save((err) => {
				if (err) {
					console.log(err);
					return;
				} else {
					res.render( 'website/wallet', {
						page_name: 'wallet',
						page_title: 'Wallet',
						is_wallet_pw: 'yes',
						sdd_coin_address: req.user.sdd_coin_address,
						ether_balance: etherDecimal,
						token_balance: tokenDecimal,
						withdraw_fee: setGasPrice,
						errors: errors,
						success: success,
						txArray: txArray,
						tokenArray: tokenArray,
						user: req.user
					});
				}
			});
		}
		else {
			console.log("Withdraw Password ERROR");
			
			let errors = [{
				param: 'withdraw_target',
				msg: 'Wrong Password',
				value: ''
			}]
			res.render( 'website/wallet', {
				page_name: 'wallet',
				page_title: 'Wallet',
				is_wallet_pw: 'yes',
				sdd_coin_address: req.user.sdd_coin_address,
				ether_balance: etherDecimal,
				token_balance: tokenDecimal,
				withdraw_fee: setGasPrice,
				errors: errors,
				success: '',
				txArray: txArray,
				tokenArray: tokenArray,
				user: req.user
			});
		}
		/**
		bcrypt.compare(password, req.user.password, (err, isMatch) => {
			if (err) throw err;
			if (isMatch) {
				console.log("Withdraw Action");
				
				let sendParm = new Object();
				
				sendParm.from = req.user.sdd_coin_address;
				sendParm.to = withdraw_target;
				sendParm.chain = req.user.chain;
				sendParm.index =  req.user.index;
				
				if(withdraw_type=='ether') {
					sendParm.value = withdraw_amount;
					sendParm.gasLimit = withdraw_fee;
					sendParm.gasPrice = withdraw_fee * Math.pow(10,8);
					//let actWithDraw = axios.post('http://54.255.186.237:3000/sendEther',sendParm);
					let actWithDraw = axios.post('http://52.77.234.248:3000/sendEther',sendParm);
				}
				else {
					sendParm.value = withdraw_amount * Math.pow(10,8);
					sendParm.gasLimit = 2100000;
					sendParm.gasPrice = withdraw_fee * Math.pow(10,8);
					//let actWithDraw = axios.post('http://54.255.186.237:3000/sendToken',sendParm);
					let actWithDraw = axios.post('http://52.77.234.248:3000/sendToken',sendParm);
					
					console.log(actWithDraw);
					console.log(actWithDraw.data);
				}
				
				//console.log(actWithDraw);
				
				res.redirect('/');
			} else {
				console.log("Withdraw ERROR");
				res.redirect('/faq');
			}
		});
		**/
	}
}

exports.getWithdrawList = async ( req, res, next ) => {
	/**
	let txList = new Array();
	let tokenList = new Array();
	
	try {
		txList =  await Withdraw.find(
			{
				"reg_date": {'$gte': req.params.startDate + " 00:00:00",'$lt': req.params.endDate + " 23:59:59"},
				"withdraw_type": {'$eq': 'ether'},
				$or: 
					[ 
					 { "from": req.user.sdd_coin_address }, 
					 { "to": req.user.sdd_coin_address }
					]
			}
		);
	}
	catch(e) {
		console.error(e);
	}
	
	try {
		tokenList =  await Withdraw.find(
			{
				"reg_date": {'$gte': req.params.startDate,'$lt': req.params.endDate},
				"withdraw_type": {'$eq': 'token'},
				$or: 
					[ 
					 { "from": req.user.sdd_coin_address }, 
					 { "to": req.user.sdd_coin_address }
					]
			}
		);
	}
	catch(e) {
		console.error(e);
	}
	
	for(var i=0; i<txList.length; i++) {
		if(txList[i].withdrawer==req.user.sdd_coin_address) txList[i].withdraw_direction = 'withdraw';
		else txList[i].withdraw_direction = 'deposit';
		
		txList[i].show_date = moment(txList[i].reg_date).format("YYYY-MM-DD HH:mm:ss");
		txList[i].show_age = getPassedTime(moment(txList[i].reg_date).format("X"));
	}
	for(var i=0; i<tokenList.length; i++) {
		if(tokenList[i].withdrawer==req.user.sdd_coin_address) tokenList[i].withdraw_direction = 'withdraw';
		else tokenList[i].withdraw_direction = 'deposit';
		
		tokenList[i].show_date = moment(tokenList[i].reg_date).format("YYYY-MM-DD HH:mm:ss");
		tokenList[i].show_age = getPassedTime(moment(tokenList[i].reg_date).format("X"));
	}
	**/
	let txArray = new Array();
	let tokenArray = new Array();
	
	var startTimeStamp = Math.floor((new Date(req.params.startDate + " 00:00:00").getTime() / 1000));
	var endTimeStamp = Math.floor((new Date(req.params.endDate + " 23:59:59").getTime() / 1000))
	
	try {
		var txlist = await etherscan.account.txlist(req.user.sdd_coin_address, 1, 'latest', 'desc');
		//var txlist = await etherscan.account.txlist('0x56b4768D435B095c754A6a44b5210EC8f77f2Bc3', 1, 'latest', 'desc');
		for(var i=0;i<txlist.result.length; i++) {
			if( startTimeStamp < txlist.result[i].timeStamp && endTimeStamp > txlist.result[i].timeStamp ) {
				var tempObj = new Object();
				
				tempObj.blockNumber 		= txlist.result[i].blockNumber;
				tempObj.timeStamp 			= getUnixTime(txlist.result[i].timeStamp);
				tempObj.hash 				= txlist.result[i].hash;
				tempObj.from 				= txlist.result[i].from;
				tempObj.to 					= txlist.result[i].to;
				tempObj.value 				= (txlist.result[i].value / Math.pow(10,18)).toFixed(3);
				tempObj.gas 				= txlist.result[i].gas;
				tempObj.gasPrice 			= (txlist.result[i].gasPrice / Math.pow(10,8)).toFixed(3);
				tempObj.txFee				= ((txlist.result[i].gasUsed *  (txlist.result[i].gasPrice / Math.pow(10,9)) ) / Math.pow(10,9)).toFixed(9);
				tempObj.passedTime 			= getPassedTime(txlist.result[i].timeStamp);
				tempObj.isError				= txlist.result[i].isError;
				tempObj.division			= 'withdraw';

				if(txlist.result[i].from != req.user.sdd_coin_address.toLowerCase()) tempObj.division = 'deposit';
				txArray.push(tempObj);
			}
		}
	}
	catch(error) {
		console.error(error);
	}

	try {
		var tokenlist = await etherscan.account.tokentx(req.user.sdd_coin_address, '', 1, 'latest', 'desc');
		//var tokenlist = await etherscan.account.tokentx('0x56b4768D435B095c754A6a44b5210EC8f77f2Bc3', '', 1, 'latest', 'desc');
		for(var i=0;i<tokenlist.result.length; i++) {
			if( startTimeStamp < tokenlist.result[i].timeStamp && endTimeStamp > tokenlist.result[i].timeStamp ) {
				var tempObj = new Object();

				tempObj.blockNumber 		= tokenlist.result[i].blockNumber;
				tempObj.timeStamp 			= getUnixTime(tokenlist.result[i].timeStamp);
				tempObj.hash 				= tokenlist.result[i].hash;
				tempObj.from 				= tokenlist.result[i].from;
				tempObj.to 					= tokenlist.result[i].to;
				tempObj.value 				= (tokenlist.result[i].value / Math.pow(10,8)).toFixed(3);
				tempObj.gas 				= tokenlist.result[i].gas;
				tempObj.gasPrice 			= (tokenlist.result[i].gasPrice / Math.pow(10,8)).toFixed(3);
				tempObj.txFee				= ((tokenlist.result[i].gasUsed *  (tokenlist.result[i].gasPrice / Math.pow(10,9)) ) / Math.pow(10,9)).toFixed(9);
				tempObj.passedTime 			= getPassedTime(tokenlist.result[i].timeStamp);
				tempObj.division			= 'withdraw';

				if(tokenlist.result[i].from == req.user.sdd_coin_address) tempObj.division = 'deposit';
				tempObj.tokenSymbol			= tokenlist.result[i].tokenSymbol;

				tokenArray.push(tempObj);
			}
		}
	}
	catch(error) {
		console.error(error);
	}
	
	res.render( 'website/withdraw-list', {
		page_name: 'wallet',
		page_title: 'Wallet',
		startDate: req.params.startDate,
		endDate: req.params.endDate,
		txList: txArray,
		tokenList: tokenArray
	});
}

exports.getWithdrawDetail = async ( req, res, next ) => {
	let txHash = "";
	let showArray = new Array();
	let showObj = new Object();
	
	if(req.params.hash=="none") {
		txHash = "Error";
		showObj.Result = "No Result";
	}
	else {
		txHash = req.params.hash;
		var txDetail = await etherscan.proxy.eth_getTransactionByHash(txHash);
		var txReceipt = await etherscan.proxy.eth_getTransactionReceipt(txHash);
		showObj.From = txDetail.result.from;
		showObj.To = txDetail.result.to;
		showObj.Value = parseInt(txDetail.result.value).toString(10) / Math.pow(10,18);
		showObj.Gas = parseInt(txDetail.result.gas).toString(10);
		showObj.GasPrice = ( parseInt(txDetail.result.gasPrice).toString(10) / Math.pow(10,9) ).toFixed(3);
		showObj.GasUsed = parseInt(txReceipt.result.gasUsed).toString(10);
		showObj.txFee = ((parseInt(txReceipt.result.gasUsed).toString(10) *  (parseInt(txDetail.result.gasPrice).toString(10) / Math.pow(10,9)) ) / Math.pow(10,9)).toFixed(9);
		
		if(txReceipt.result.logs.length > 0) {		//token
			showObj.Value = parseInt(txDetail.result.value).toString(10);
			showObj.TransactionsType = 'Token';
			showObj.TransactionsTo = txReceipt.result.logs[0].topics[2].replace("000000000000000000000000","");
		}
	}
	
	res.render( 'website/withdraw-detail', {
		page_name: 'wallet',
		page_title: 'Wallet',
		txHash: txHash,
		showObj: showObj
	});
}
















function getUnixTime(unixtime) {
	var u = new Date(unixtime*1000);
	var month = parseInt(u.getUTCMonth()) + 1;
	return u.getUTCFullYear() +
		'-' + ('0' + month).slice(-2) +
		'-' + ('0' + u.getUTCDate()).slice(-2) + 
		' ' + ('0' + u.getUTCHours()).slice(-2) +
		':' + ('0' + u.getUTCMinutes()).slice(-2) +
		':' + ('0' + u.getUTCSeconds()).slice(-2)
		//'.' + (u.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) 
}


function getPassedTime(unixtime) {
	var retTime = "";
	var nowTime = (new Date()).getTime();
	var passedTime = Math.round( ( nowTime - (unixtime * 1000) ) / 1000 );
	
	var date = parseInt(passedTime/86400);
	var hour = parseInt((passedTime%86400)/3600);
	var min = parseInt((passedTime%3600)/60);
	var sec = passedTime%60;
	
	if(date > 0) retTime += date + "day ";
	if(hour > 0) retTime += hour + "hrs ";
	if(min > 0 && date == 0) retTime += min + "mins ";
	if(sec > 0 && ( date == 0 && hour == 0 )) retTime += sec + "sec ";
	
	return retTime;
}