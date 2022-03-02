const express = require( 'express' );
const path = require('path');
const router = express.Router();

const {userAuthenticated} = require('./../middleware/authentication');


/**
 * Controllers (route handlers).
 */
const userController = require('../controllers/website/user');
const homeController = require('../controllers/website/home');
const investorController = require('../controllers/website/investor');
const grandDerbyController = require('../controllers/website/grand-derby-holdem-masters');
const faqController = require('../controllers/website/faq');
const contactController = require('../controllers/website/contact');
const walletController = require('../controllers/website/wallet');

/* GET Login page. */
router.get('/login', userController.getLogin);

/* POST Login page. */
router.post('/login', userController.postLogin);

/* GET Register page. */
router.get('/register', userController.getRegister);

/* POST Register page. */
router.post('/register', userController.postRegister);

/* GET Check email address */
router.get( '/auth/check-email', userController.checkEmail);

/* GET Check Phone NUmber */
router.get( '/auth/check-phone', userController.checkPhone);

/* GET Forgot Password page. */
router.get('/forgot-password', userController.getForgot);

/* POST Forgot Password page. */
router.post('/forgot-password', userController.postForgot);
/* GET home page. */
router.get('/', homeController.getHome);

/* GET Investor page. */
router.get('/investor', investorController.getInvestor  );
router.post('/investor', investorController.postInvestor  );
router.post('/recommender', investorController.postRecommender  );

/* GET Grand Derby page. */
router.get('/grand-derby-holdem-masters', grandDerbyController.getGrandDerbyHoldemMasters );

/* GET Wallet page. */
router.get('/wallet', userAuthenticated, walletController.getWallet);

router.post('/wallet-password', userAuthenticated, walletController.postWalletPW);
router.post('/wallet-withdraw', userAuthenticated, walletController.postWalletWD);

router.get('/withdraw-list/:startDate/:endDate', userAuthenticated, walletController.getWithdrawList);
//router.get('/withdraw-detail', userAuthenticated, walletController.getWithdrawDetail);

router.get('/withdraw-detail/:hash',userAuthenticated, walletController.getWithdrawDetail);

/* GET FAQ page. */
router.get('/faq', faqController.getFAQ);

/* GET Contact page. */
router.get( '/contact-us', contactController.getContact);

/* POST Contact Page mailer */
router.post( '/contact-us', contactController.postContact);

/* GET Account Page  */
router.get( '/account', userAuthenticated, userController.getAccount);

/* POST Account Page  */
router.post( '/account', userAuthenticated, userController.postAccount);

/* GET Logout page */
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/login');
});

router.get('/en', (req, res) => {
  res.cookie('lang', 'en');
  res.redirect('back');
});

router.get('/ko', (req, res) => {
  res.cookie('lang', 'kr');
  res.redirect('back');
});

router.get('/jp', (req, res) => {
  res.cookie('lang', 'jp');
  res.redirect('back');
});

router.get('/cn', (req, res) => {
  res.cookie('lang', 'cn');
  res.redirect('back');
});

router.get('/wp', function (req, res) {
   var file = path.join(__dirname, '../files/SDD Coin White Paper V1.02.pdf');
   res.download(file, function (err) {
       if (err) {
           //console.log("Error");
           console.log(err);
       } else {
           //console.log("Success");
       }
   });
});


module.exports = router;