const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const userAgent = require('../controllers/userAgentController');


const router = express.Router();

router.use(authController.protect);

router.post('/changePassword', authController.updatePassword);
router.get('/userInfo', authController.protect,userController.getMe, userController.getUser);
router.get('/logs', userAgent.getMe, userAgent.logs);

router.get('/allDetails', userController.allDetails);

router.get('/totalReferral', userController.totalReferral);
router.get('/getReferralHistory', userController.getMe, userController.getReferralHistory);
router.get('/upgradeStatus', userController.checkUpgrade);
router.get('/checkPackage', userController.checkPackage);
router.get('/user-info', userController.userInfomation);
// CHECK BLOCK TXN's
router.get('/checktxn', userController.checkBlockTxn);



router.post(
        '/updateProfile',
        userController.uploadUserPhoto,
        userController.resizeUserPhoto,
        userController.updateMe
);

module.exports = router;
