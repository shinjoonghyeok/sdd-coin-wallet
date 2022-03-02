const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const logger = require('morgan');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require('passport');
const config = require('./config/database');
const i18n = require('./config/i18n');

const websiteRouter = require('./routes/website');
const adminRouter = require('./routes/admin');

mongoose.connect(config.database, { useNewUrlParser: true });
let db = mongoose.connection;

// Check connection
db.once('open', () => {
	console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err) => {
	console.log('MongoDB error!', err);
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
	secret: 'SDDT3chC0in@pP',
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ 
		mongooseConnection: mongoose.connection,
		autoRemove: 'native',
		ttl: 2 * 24 * 60 * 60 // = 14 days. Default
	})
}));


// Express Messages Middleware
app.use(require('connect-flash')());
app.use((req, res, next) => {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: (param, msg, value) => {
		var namespace = param.split('.')
		, root    = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg   : msg,
			value : value
		};
	}
}));

// Passport Config
require('./config/passport')(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(i18n);

app.get('*', (req, res, next) => {
	res.locals.user = req.user || null;
	next();
});



app.use('/', websiteRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
