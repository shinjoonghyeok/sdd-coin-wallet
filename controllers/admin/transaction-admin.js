const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W');
//const etherscan = require('etherscan-api').init('82N8ZWX4NAETD6M9UB4N44TDJZEDK4IZ6W','ropsten','3000');
const moment = require('moment');

const Withdraw = require('./../../models/withdraw');
/**
* GET /
* Transaction Details Page.
*/
exports.getTransactionAdmin = async ( req, res, next ) => {
	res.render( 'admin/transaction-admin', {
		page_name: 'transaction-admin',
		page_title: 'Transaction Admin'
	});
};


exports.getTransactionList = async ( req, res, next ) => {
	let txArray = new Array();
	let etherArray = new Array();
	let tokenArray = new Array();
	
	var startDate = req.params.startDate + " 00:00:00";
	var endDate = req.params.endDate + " 23:59:59";
	
	var startTimeStamp = Math.floor((new Date(startDate).getTime() / 1000));
	var endTimeStamp = Math.floor((new Date(endDate).getTime() / 1000))
	
	var searchStr = req.params.searchStr;
	
	try {
		var txlist = await etherscan.account.txlist('0x88014cca84ac538b9494625ae656fd5eb2320bc6', 1, 'latest', 'desc');
		//var txlist = await etherscan.account.txlist('0x56b4768D435B095c754A6a44b5210EC8f77f2Bc3', 1, 'latest', 'desc');
		for(var i=0;i<txlist.result.length; i++) {
			var strFlag = true;
			if(searchStr!="^NONE^") {
				strFlag = false;
				if(txlist.result[i].from.search(searchStr) > 0) strFlag = true;
				if(txlist.result[i].to.search(searchStr) > 0) strFlag = true;
				if(txlist.result[i].hash.search(searchStr) > 0) strFlag = true;
			}
			if( strFlag && startTimeStamp < txlist.result[i].timeStamp && endTimeStamp > txlist.result[i].timeStamp ) {
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

				txArray.push(tempObj);
			}
		}
	}
	catch(error) {
		console.error(error);
	}
	
	try {
		let searchObj = new Object();
		searchObj.reg_date = {'$gte': startDate,'$lt': endDate};
		searchObj.withdraw_type = {'$eq': 'ether'};
		if(searchStr!="^NONE^") {
			//searchObj.$or = [ { "from": {$regex: '.*' + searchStr + '.*'} }, { "to": {$regex: '.*' + searchStr + '.*'} },{ "withdraw_txhash": {$regex: '.*' + searchStr + '.*'} } ];
			searchObj.$or = [ { "from": {$regex: '.*' + searchStr + '.*', $options: "i"} }, { "to": {$regex: '.*' + searchStr + '.*', $options: "i"} },{ "withdraw_txhash": {$regex: '.*' + searchStr + '.*', $options: "i"} } ];
		}
		etherArray =  await Withdraw.find(searchObj);
		
		for(var i=0; i<etherArray.length; i++) {
			etherArray[i].show_date = moment(etherArray[i].reg_date).format("YYYY-MM-DD HH:mm:ss");
			etherArray[i].show_age = getPassedTime(moment(etherArray[i].reg_date).format("X"));
		}
	}
	catch(e) {
		console.error(e);
	}
	
	try {
		let searchObj = new Object();
		searchObj.reg_date = {'$gte': startDate,'$lt': endDate};
		searchObj.withdraw_type = {'$eq': 'token'};
		if(searchStr!="^NONE^") {
			//searchObj.$or = [ { "from": {$regex: '.*' + searchStr + '.*'} }, { "to": {$regex: '.*' + searchStr + '.*'} },{ "withdraw_txhash": {$regex: '.*' + searchStr + '.*'} } ];
			searchObj.$or = [ { "from": {$regex: '.*' + searchStr + '.*', $options: "i"} }, { "to": {$regex: '.*' + searchStr + '.*', $options: "i"} },{ "withdraw_txhash": {$regex: '.*' + searchStr + '.*', $options: "i"} } ];
		}
		tokenArray =  await Withdraw.find(searchObj);
		
		for(var i=0; i<tokenArray.length; i++) {
			tokenArray[i].show_date = moment(tokenArray[i].reg_date).format("YYYY-MM-DD HH:mm:ss");
			tokenArray[i].show_age = getPassedTime(moment(tokenArray[i].reg_date).format("X"));
		}
	}
	catch(e) {
		console.error(e);
	}
	
	
	res.render( 'admin/transaction-list', {
		page_name: 'transaction-list',
		page_title: 'Transaction List',
		txList: txArray,
		etherList: etherArray,
		tokenList: tokenArray
	});
};

exports.getTransactionDetail = async ( req, res, next ) => {
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
	
	res.render( 'admin/transaction-detail', {
		page_name: 'transaction-detail',
		page_title: 'Transaction Detail',
		txHash: txHash,
		showObj: showObj
	});
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