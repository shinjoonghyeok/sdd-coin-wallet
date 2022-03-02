const moment = require('moment');
let nowDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");


/**
 * GET /
 * Home page.
 */
exports.getHome = ( req, res, next ) => {
	logData("Home Start")
	let roadmapIMG = null;
	if(req.cookies.lang=='kr') roadmapIMG = 'roadmap_ko.png';
	else if(req.cookies.lang=='jp') roadmapIMG = 'roadmap_jp.png';
	else if(req.cookies.lang=='cn') roadmapIMG = 'roadmap_en.png';
	else roadmapIMG = 'roadmap_en.png';
	
	res.render( 'website/index', {
		page_name: 'home',
		page_title: 'Home',
		roadmapIMG: roadmapIMG
	});
};

function logData(msg) {
	console.log("[" + nowDate + "] " + msg);
}