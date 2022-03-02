const nodemailer = require( 'nodemailer' );
//const sddMailAddress = 'hahm@ianswer.co.kr';
const sddMailAddress = 'derbyholdem@gmail.com';

/**
* GET /
* Contact page.
*/
exports.getContact = (req, res, next) => {
	res.render( 'website/contact-us', {
		page_name: 'contact-us',
		page_title: 'Contact Us',
		message_sent: ''
	});
};

/**
* POST / Contact
* Send a contact form via Nodemailer.
*/

exports.postContact = ( req, res ) => {
	console.log("dddd");
	const output = `
		<p>You have a new message from SDD website contact form</p>
		<h3>Message Details</h3>
		<ul style="list-style-type: square;">  
		<li>Name: ${req.body.title}</li>
		<li>Email: ${req.body.email}</li>
		</ul>
		<h3>Message</h3>
		<p style="white-space: pre-line;">${req.body.message}</p>
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
	console.log(req.body.email);
	let mailOptions = {
		from: `SDD Tech website contact`, // sender address
		to: `${sddMailAddress}, ssd@ianswer.co.kr`, // list of receivers
		subject: req.body.title, // Subject line
		text: req.body.message, // plaintext body
		html: output, // html body,
		replyTo: req.body.email
	};

	// send mail with defined transport object
	transporter.sendMail( mailOptions, ( error, info ) => {
		if ( error ) {
			return console.log( error );
		}
		console.log( 'Message sent: %s', info.messageId );
		console.log( 'Preview URL: %s', nodemailer.getTestMessageUrl( info ) );
		
		

		res.render( 'website/contact-us', {
			page_name: 'contact-us',
			page_title: 'Contact Us',
			user: req.user,
			message_sent: 'Message has been sent'
		});
	});
}


