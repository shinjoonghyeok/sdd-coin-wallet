const express = require( 'express' );
const router = express.Router();

const {adminAuthenticated} = require('./../middleware/authentication');

const adminController = require('../controllers/admin/admin');
const transactionController = require('../controllers/admin/transaction-admin');
const memberController = require('../controllers/admin/member-admin');
const faqController = require('../controllers/admin/faq-admin');
const announcementController = require('../controllers/admin/announcement');

/* GET Admin Login page. */
router.get('/', adminController.getLogin);

/* POST Admin Login page. */
router.post('/', adminController.postLogin);

/* GET Admin Member List page. */
router.get('/member-admin', adminAuthenticated, memberController.getMemberAdmin);
router.get('/member-list/:startDate/:endDate/:searchStr', adminAuthenticated, memberController.getMemberList);
router.get('/member-detail/:hash', adminAuthenticated, memberController.getMemberDetail);
router.get('/member-transaction/:hash', adminAuthenticated, memberController.getMemberTransaction);
router.post('/member-chgpasswd', adminAuthenticated, memberController.chgMemberPassword);

/* GET Admin Transaction Details page. */
router.get('/transaction-admin', adminAuthenticated, transactionController.getTransactionAdmin);
router.get('/transaction-list/:startDate/:endDate/:searchStr', adminAuthenticated, transactionController.getTransactionList);
router.get('/transaction-detail/:hash', adminAuthenticated, transactionController.getTransactionDetail);

/* GET Admin Announcement page. */
router.get('/announcement', adminAuthenticated,announcementController.getAnnouncement);

/* GET Admin page. */
router.get('/account', adminAuthenticated, adminController.getAccount);
router.post('/account', adminAuthenticated, adminController.postAccount);

router.get('/faq-admin', adminAuthenticated, faqController.getFAQAdmin);
router.post('/faq-regist', adminAuthenticated, faqController.registFAQ);
router.post('/faq-delete', adminAuthenticated, faqController.deleteFAQ);
router.get('/faq-update/:idx', adminAuthenticated, faqController.getUpdateFAQ);
router.post('/faq-update', adminAuthenticated, faqController.postUpdateFAQ);


/* GET Logout page */
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/admin');
});


module.exports = router;