const express = require('express');
// const userController = require('./../controllers/userController');
const authController = require('../controllers/authController');
// const walletController = require('../controllers/walletController');
 const TwofaController = require('../controllers/2faController');




const router = express.Router();

// router.post('/randomGenerates', authController.randomGenerates);


// router.get('/generateQrCode', authController.protect, TwofaController.getMe, TwofaController.generateQrCode);
// router.post('/activate2FA', authController.protect, TwofaController.getMe, TwofaController.activate2FA);
// router.post('/activate2Auth', authController.protect, TwofaController.getMe, TwofaController.activate2Auth);
// router.get('/generateOTP', authController.protect, TwofaController.getMe, TwofaController.generateOTP);
// router.post('/deactivateAuth', authController.protect, TwofaController.getMe, TwofaController.deactivateAuth);


// router.get('/generateAuthOTP', TwofaController.generateOtherOTP);





// router.post('/signup',TwofaController.verifyOtherOneTimePassword, authController.register);
router.post('/signup',authController.register);


router.post('/login', authController.login);

router.get('/logout', authController.protect, authController.logout);
router.get('/generateOTP', TwofaController.generateOtherOTP);
 router.get('/checkSponsor', authController.checkSponsor);
 router.get('/getWallets', authController.protect, authController.getWallets);



// router.get('/userAgent', authController.protect, authController.logout);



router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/walletaddressupdate',authController.protect, authController.updateWalletAddress);
router.post('/profileUpdate',authController.protect, authController.UpdateProfile);

// Protect all routes after this middleware
// router.use(authController.protect);

// router.patch('/updateMyPassword', authController.updatePassword);
// router.get('/me', userController.getMe, userController.getUser);
// router.patch(
//   '/updateMe',
//   userController.uploadUserPhoto,
//   userController.resizeUserPhoto,
//   userController.updateMe
// );
// router.delete('/deleteMe', userController.deleteMe);

// router.use(authController.restrictTo('admin'));

// router
//   .route('/')
//   .get(userController.getAllUsers)
//   .post(userController.createUser);

// router
//   .route('/:id')
//   .get(userController.getUser)
//   .patch(userController.updateUser)
//   .delete(userController.deleteUser);

module.exports = router;
