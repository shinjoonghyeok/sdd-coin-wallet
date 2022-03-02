const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W');
//const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W','ropsten','3000');


const moment = require('moment');
const axios = require('axios');

const apiConfig = require('./../../config/etheraip');
const User = require('./../../models/user');
const Wallet = require('./../../models/wallet');

/**
* GET /
* Member List Page.
*/
exports.getMemberAdmin = async ( req, res, next ) => {
	//console.log(req.user)
	res.render( 'admin/member-admin', {
		page_name: 'member-admin',
		page_title: 'Member Admin'
	});
};

exports.getMemberList = async ( req, res, next ) => {
	//console.log(req.user)
	var startDate = req.params.startDate + " 00:00:00";
	var endDate = req.params.endDate + " 23:59:59";
	
	var startTimeStamp = Math.floor((new Date(startDate).getTime() / 1000));
	var endTimeStamp = Math.floor((new Date(endDate).getTime() / 1000))
	
	var searchStr = req.params.searchStr;

	let searchObj = new Object();
	searchObj.reg_date = {'$gte': startDate,'$lt': endDate};
	if(searchStr!="^NONE^") {
		searchObj.$or = [ { "sdd_coin_address": {$regex: '.*' + searchStr + '.*'} }, { "email": {$regex: '.*' + searchStr + '.*'} },{ "phone_number": {$regex: '.*' + searchStr + '.*'} } ];
	}

	let memberList =  await User.find(searchObj);
	let memberArray = new Array();
	
	for(var i=0; i<memberList.length; i++) {
		let memberObj = new Object();
		
		let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${memberList[i].sdd_coin_address}`);
		
		memberObj.email 			= memberList[i].email;
		memberObj.phone_number 		= memberList[i].phone_number;
		memberObj.sdd_coin_address	= memberList[i].sdd_coin_address;
		memberObj.ether_address		= memberList[i].ether_address;
		memberObj.token_balance		= tokenBalance.data.balnace / Math.pow(10,8);
		memberObj.recommender_id	= memberList[i].recommender_id;
		memberObj.reg_date 			= moment(memberList[i].reg_date).format("YYYY-MM-DD HH:mm:ss");
		
		memberArray.push(memberObj);
	}


	res.render( 'admin/member-list', {
		page_name: 'member-list',
		page_title: 'Member List',
		member_list: memberArray
	});
};

exports.getMemberDetail = async ( req, res, next ) => {
	//console.log(req.user)
	console.log(req.params.hash);
		
	var memberHash = req.params.hash;

	let searchObj = new Object();
	let retObj = new Object();
	let is_wallet = false;
	searchObj.sdd_coin_address = memberHash;

	let memberInfo = await User.findOne(searchObj);
	let walletInfo = await Wallet.findOne(searchObj);
	let ethereumBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/ether/${memberHash}`);
	let tokenBalance = await axios.get(apiConfig.api_method + "://" + apiConfig.api_ipaddr + ":" + apiConfig.api_port + `/token/${memberHash}`);
	
	retObj.Email = memberInfo.email;
	retObj.PhoneNumber = memberInfo.phone_number;
	retObj.SDDAddress = memberInfo.sdd_coin_address;
	retObj.EtherAddress = memberInfo.ether_address;
	retObj.etherBalace = ethereumBalance.data.balnace / Math.pow(10,18);
	retObj.tokenBalance = tokenBalance.data.balnace / Math.pow(10,8);
	retObj.RegistDate = moment(memberInfo.reg_date).format("YYYY-MM-DD HH:mm:ss");
	
	if(walletInfo) is_wallet = true;

	res.render( 'admin/member-detail', {
		page_name: 'member-detail',
		page_title: 'Member Detail',
		member_info: retObj,
		is_wallet: is_wallet
	});
};


exports.getMemberTransaction = async ( req, res, next ) => {
	console.log(req.params.hash);
	
	var memberHash = req.params.hash;
	var retTxList = new Array();
	var retTokenList = new Array();
	
	try {
		var txlist = await etherscan.account.txlist(memberHash, 1, 'latest', 'desc');
		//retTxList = txlist.result;
		
		for(var i=0;i<txlist.result.length; i++) {
			let retObj = new Object();
			
			retObj.blockNumber 				= txlist.result[i].blockNumber;
			retObj.timeStamp 				= getUnixTime(txlist.result[i].timeStamp);
			retObj.passedTime 				= getPassedTime(txlist.result[i].timeStamp);
			retObj.hash 					= txlist.result[i].hash;
			retObj.nonce 					= txlist.result[i].nonce;
			retObj.blockHash 				= txlist.result[i].blockHash;
			retObj.transactionIndex 		= txlist.result[i].transactionIndex;
			retObj.from 					= txlist.result[i].from;
			retObj.to 						= txlist.result[i].to;
			retObj.value 					= (txlist.result[i].value / Math.pow(10,18)).toFixed(3);
			retObj.gas 						= txlist.result[i].gas;
			retObj.gasPrice 				= (txlist.result[i].gasPrice / Math.pow(10,8)).toFixed(3);
			retObj.txFee					= ((txlist.result[i].gasUsed *  (txlist.result[i].gasPrice / Math.pow(10,9)) ) / Math.pow(10,9)).toFixed(9);
			retObj.isError 					= txlist.result[i].isError;
			retObj.txreceipt_status 		= txlist.result[i].txreceipt_status;
			retObj.input 					= txlist.result[i].input;
			retObj.contractAddress 			= txlist.result[i].contractAddress;
			retObj.cumulativeGasUsed 		= txlist.result[i].cumulativeGasUsed;
			retObj.gasUsed 					= txlist.result[i].gasUsed;
			retObj.confirmations 			= txlist.result[i].confirmations;
			
			retTxList.push(retObj);
		}
		
		//console.log(retTxList);
	}
	catch(error) {
		console.error("error", error);
		
		
		
		
		
	}
	
	try {
		var tokenlist = await etherscan.account.tokentx(memberHash, '', 1, 'latest', 'desc');
		//retTokenList = tokenlist.result;
		
		for(var i=0;i<tokenlist.result.length; i++) {
			let retObj = new Object();
			
			retObj.blockNumber 				= tokenlist.result[i].blockNumber;
			retObj.timeStamp 				= getUnixTime(tokenlist.result[i].timeStamp);
			retObj.passedTime 				= getPassedTime(tokenlist.result[i].timeStamp);
			retObj.hash 					= tokenlist.result[i].hash;
			retObj.nonce 					= tokenlist.result[i].nonce;
			retObj.blockHash 				= tokenlist.result[i].blockHash;
			retObj.from 					= tokenlist.result[i].from;
			retObj.contractAddress 			= tokenlist.result[i].contractAddress;
			retObj.to 						= tokenlist.result[i].to;
			retObj.value 					= (tokenlist.result[i].value / Math.pow(10,18)).toFixed(3);
			retObj.tokenName 				= tokenlist.result[i].tokenName;
			retObj.tokenSymbol 				= tokenlist.result[i].tokenSymbol;
			retObj.tokenDecimal 			= tokenlist.result[i].tokenDecimal;
			retObj.transactionIndex 		= tokenlist.result[i].transactionIndex;
			retObj.gas 						= tokenlist.result[i].gas;
			retObj.gasPrice 				= (tokenlist.result[i].gasPrice / Math.pow(10,8)).toFixed(3);
			retObj.txFee					= ((tokenlist.result[i].gasUsed *  (tokenlist.result[i].gasPrice / Math.pow(10,9)) ) / Math.pow(10,9)).toFixed(9);
			retObj.gasUsed 					= tokenlist.result[i].gasUsed;
			retObj.cumulativeGasUsed 		= tokenlist.result[i].cumulativeGasUsed;
			retObj.input 					= tokenlist.result[i].input;
			retObj.confirmations 			= tokenlist.result[i].confirmations;
			
			retTokenList.push(retObj)
		}
		
		console.log(retTokenList);
	}
	catch(error) {
		console.error("error", error);
	}
	
	res.render( 'admin/member-transaction', {
		page_name: 'member-transaction',
		page_title: 'Member transaction',
		txList: retTxList,
		tokenList: retTokenList
	});
	
};

exports.chgMemberPassword  = async ( req, res, next ) => {
	console.log(req.body);
};


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