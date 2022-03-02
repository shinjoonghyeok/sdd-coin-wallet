const moment = require('moment');

let Faq = require('./../../models/faq');
/**
 * GET /
 * FAQ Admin page.
 */
exports.getFAQAdmin = async (req, res, next) => {
	let faqList =  await Faq.find({
		delete: false
	});
	let faqArray = new Array();
	
	for(var i=0; i<faqList.length; i++) {
		let faqObj = new Object();
		
		faqObj.idx		 		= faqList[i].index;
		faqObj.faq_title 		= faqList[i].title;
		faqObj.faq_content 		= faqList[i].content;
		faqObj.faq_language		= faqList[i].language;
		faqObj.faq_writer		= faqList[i].writer;
		faqObj.reg_date 		= moment(faqList[i].reg_date).format("YYYY-MM-DD HH:mm:ss")
		faqObj.reg_date 		= moment(faqList[i].update_date).format("YYYY-MM-DD HH:mm:ss")
		
		faqArray.push(faqObj);
	}
	
	res.render('admin/faq-admin', {
		page_name: 'faq-admin',
		page_title: 'FAQ-Admin',
		faq_list: faqArray
	});
};

exports.registFAQ = async (req, res, next) => {
	let faq_title = req.body.faq_title;
	let faq_language = req.body.faq_language;
	let faq_content = req.body.faq_content;

	req.checkBody('faq_title', 'Title is required').notEmpty();
	req.checkBody('faq_language', 'Language is required').notEmpty();
	req.checkBody('faq_content', 'Content is required').notEmpty();
	let errors = req.validationErrors();

	if (errors) {
		return res.redirect(411,'back');
	}
	
	let newFaq = new Faq({
		title: faq_title,
		language: faq_language,
		content: faq_content,
		writer: req.user.email
	});
	
	newFaq.save((err) => {
		if (err) {
			console.log(err);
			return res.redirect(500,'back');
		} else {
			res.redirect('/admin/faq-admin');
		}
	});
};


exports.getUpdateFAQ = async (req, res, next) => {
	let idx = req.params.idx;
	
	let faqInfo =  await Faq.findOne({
		index: idx
	});
	
	res.render('admin/faq-update', {
		page_name: 'faq-update',
		page_title: 'FAQ-Update',
		faqInfo: faqInfo
	});
};

exports.postUpdateFAQ = async (req, res, next) => {
	let index = req.body.faq_idx;
	let faq_title = req.body.faq_title;
	let faq_content = req.body.faq_content;
	let faq_language = req.body.faq_language;
	
	req.checkBody('faq_title', 'Title is required').notEmpty();
	req.checkBody('faq_content', 'Content is required').notEmpty();
	req.checkBody('faq_language', 'Language is required').notEmpty();
	let errors = req.validationErrors();

	if (errors) {
		return res.redirect(411,'back');
	}
	
	var nowDate = new Date();
	Faq.update({ index: index }, { $set: { title: faq_title, content: faq_content, language: faq_language, update_date: nowDate }}, function(err){
		if(err){
			console.log(err);
			return res.redirect(500,'back');
		} 
		else {
			res.redirect('/admin/faq-admin');
		}
	});
};

exports.deleteFAQ = (req, res, next) => {
	let index = req.body.faq_idx;
	
	var nowDate = new Date();
	Faq.update({ index: index }, { $set: { delete: true, update_date: nowDate }}, function(err){
		if(err){
			console.log(err);
			return res.redirect(500,'back');
		} 
		else {
			res.redirect('/admin/faq-admin');
		}
	});
};