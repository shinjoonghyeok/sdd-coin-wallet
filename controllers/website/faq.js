const moment = require('moment');

let Faq = require('./../../models/faq');

/**
 * GET /
 * FAQ page.
 */
exports.getFAQ = async (req, res, next) => {
	if(typeof req.cookies.lang=="undefined") req.cookies.lang = 'en';
	
	let faqList =  await Faq.find({
		delete: false, language: req.cookies.lang
	});
	let faqArray = new Array();
	
	for(var i=0; i<faqList.length; i++) {
		let faqObj = new Object();
		
		faqObj.faq_title 		= faqList[i].title;
		faqObj.faq_content 		= faqList[i].content;
		faqObj.faq_writer		= faqList[i].writer;
		faqObj.reg_date 		= moment(faqList[i].reg_date).format("YYYY-MM-DD HH:mm:ss")
		faqObj.reg_date 		= moment(faqList[i].update_date).format("YYYY-MM-DD HH:mm:ss")
		
		faqArray.push(faqObj);
	}
	
	res.render('website/faq', {
		page_name: 'faq',
		page_title: 'FAQ',
		faq_list: faqArray
	});
};