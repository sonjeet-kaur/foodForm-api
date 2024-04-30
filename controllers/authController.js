const dotenv = require('dotenv');
const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const sponsorCount = require('../models/sponsorCountModel');
const WalletAddress = require('../models/walletAddressModel');
const Web3 = require('web3');
const TronWeb = require('tronweb');


const web3 = new Web3('https://bsc-dataseed.binance.org/');

const tronWeb = new TronWeb({
        fullNode: 'https://api.trongrid.io',
        solidityNode: 'https://api.trongrid.io',
        eventServer: 'https://api.trongrid.io'
});

// const Kyc = require('../models/kycModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const generate = require('../utils/generate');

const { RegisterValidation, LoginValidation, checkSponserValidation, changePasswordValidation, ProfileValidation } = require('../validations');
const userAgentController = require('../controllers/userAgentController');
const { sendOtp, sendEmail } = require('../utils/helpers/main_helper.js');
const { func } = require('joi');
const cryptoSafe = require('../utils/crypto');


// const randomGenerate = require('otp-generators');
// const Email = require('./../utils/email');



const signToken = async (id) => {
        return await jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
        });
};

const generateUserId = async () => {
        let username = await generate.number(8);
        // let user = await User.findOne({ username: username });
        // // if (user) {
        // //         return generateUserId();
        // // } else {
        // //         return username;
        // // }
        return username;

};




const createSendToken = async (user, type, statusCode, req, res) => {
        const token = await signToken(user._id);

        res.cookie('jwt', token, {
                expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });

        // Remove password from output
        user.password = undefined;
        // const kycDetails = await Kyc.findOne({ username: user.username });

        res.status(statusCode).json({
                status: 'success',
                token,
                message: 'User ' + type + ' successfully!',
                data: {
                        user,
                        // kyc: kycDetails
                }
        });
};


const createSendToken2 = async (user, statusCode, req, res) => {
        const token = await signToken(user._id);

        res.cookie('jwt', token, {
                expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
                ),
                httpOnly: true,
                secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });

        // Remove password from output
        user.password = undefined;
        // const kycDetails = await Kyc.findOne({ username: user.username });

        res.status(statusCode).json({
                status: 'success',
                token,
                message: 'Password Change Successfully!',
                data: {
                        user,
                        // kyc: kycDetails
                }
        });
};


exports.checkSponsor = catchAsync(async (req, res, next) => {
        const { sponsor_id } = req.query;

        const validate = checkSponserValidation.validate(req.query);
        if (!validate.error) {
                const userWalletExist = await User.findOne({ username: sponsor_id });
                if (userWalletExist) {
                        res.status(200).json({
                                status: 'success',
                                message: 'Active Sponsor!',
                                data: {
                                        status: true,
                                        name: userWalletExist.user_info.name
                                }
                        });

                } else {
                        res.status(200).json({
                                status: 'success',
                                message: 'Invaild Sponsor Id!',
                                data: {
                                        status: false
                                }
                        });
                }
        } else {
                return next(new AppError(validate.error.details[0].message, 400));
        }
})



exports.register = catchAsync(async (req, res, next) => {
        const { sponsor_id, email, firstName, lastName, password, confirm_password } = req.body;
        let username = await generateUserId();
        const validate = RegisterValidation.validate(req.body);
        if (!validate.error) {
                const checkSponsor = await User.countDocuments({ username: sponsor_id });
                if (checkSponsor <= 0) {
                        return next(new AppError('Invalid Sponsor ID!', 400));
                }
                const checkEmail = await User.countDocuments({ email: email.toLowerCase() });
                if (checkEmail > 0) {
                        return next(new AppError('E-Mail Address already exists!', 400));
                }
                if (password != confirm_password) {
                        return next(new AppError('password not matched!', 400));
                }
                const userData = {
                        sponsor_id: sponsor_id,
                        username: username,
                        password: password,
                        phone: "",
                        email: email.toLowerCase(),
                        active_status: false,
                        user_info: {
                                sponsor_id: sponsor_id,
                                firstName: firstName,
                                lastName: lastName,
                                name: firstName + " " + lastName,
                                email: email.toLowerCase(),
                                phone: "",
                                activate_date: null,
                                // country: country,
                                // country_flag: country_flag
                        }
                }

                const newUser = await User.create(userData);
                if (newUser) {
                        const refID = {
                                $push: { ref_id: { username: username, active_status: false } }
                        };
                        await User.updateOne({ username: sponsor_id }, refID);
                        add_sponser_counts(username, username, 1);
                        var type = "inactive";
                        var total = "total";
                        const sponsorUserId = await User.findOne({ username: sponsor_id });
                        await User.updateOne({ username: sponsorUserId.username }, { $inc: { [`directs.${type}`]: 1 } });
                        await User.updateOne({ username: sponsorUserId.username }, { $inc: { [`directs.${total}`]: 1 } });
                        generateWallets(username);
                        // userAgentController.userAgent(req, newUser.username, 'Register', 'User Register email');
                        createSendToken(newUser, "Registration", 200, req, res);

                }
        } else {
                return next(new AppError(validate.error.details[0].message, 400));
        }
})



async function add_sponser_counts(username, downline_id, level) {
        const user = await User.findOne({ username: username });
        if (user.sponsor_id != '') {
                const downlineArray = {
                        username: user.sponsor_id,
                        downline_id: downline_id,
                        level: level
                }
                await sponsorCount.create(downlineArray);

                username = user.sponsor_id;
                add_sponser_counts(username, downline_id, level + 1);
        }
}


exports.login = catchAsync(async (req, res, next) => {
        const { email, password } = req.body;
        // if (login_type === 'email') {
        const validate = LoginValidation.validate(req.body);
        if (!validate.error) {
                const user = await User.findOne({ email }).select('+password');
                if (!user || !(await user.correctPassword(password, user.password))) {
                        return next(new AppError('Invalid Credentials', 401));
                }
                if (!user) {
                        return next(new AppError('Record not exists !', 401));
                } else {
                        if (user.disable == true) {
                                return next(new AppError('Your account is blocked!', 401));
                        }
                        userAgentController.userAgent(req, user.username, 'Login', 'User Login via Email');
                        createSendToken(user, "Login", 200, req, res);

                        //      var message2 = `<b>A new device is using your account!</b><br><br>Hi User,<br><small>A new device signed in to your ${process.env.TITLE} account, ${email}</small><br><br><b>The Details</b><br><b>Device</b>: ${userAgents.platform}<br><b>IP Address</b>: ${clientIp}<br><b>Source</b>: ${userAgents.source}`;
                        //   const newOtp = sendEmail(user.email, 'A new device is using your account!', message2);
                        // return res.send(message2)
                }
        } else {
                return next(new AppError(validate.error.details[0].message, 400));
        }
});



exports.logout = (req, res) => {
        res.cookie('jwt', 'loggedout', {
                expires: new Date(Date.now() + 10 * 1000),
                httpOnly: true
        });
        res.status(200).json({ status: 'success' });
};

exports.protect = catchAsync(async (req, res, next) => {
        // 1) Getting token and check of it's there
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies.jwt) {
                token = req.cookies.jwt;
        }

        if (!token) {
                return next(
                        new AppError('You are not logged in! Please log in to get access.', 401)
                );
        }

        // 2) Verification token
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        // 3) Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
                return next(
                        new AppError(
                                'You are not logged in! Please log in to get access.',
                                401
                        )
                );
        }

        // 4) Check if user changed password after the token was issued
        if (currentUser.changedPasswordAfter(decoded.iat)) {
                return next(
                        new AppError('User recently changed password! Please log in again.', 401)
                );
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
        res.locals.user = currentUser;
        next();
});

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
        if (req.cookies.jwt) {
                try {
                        // 1) verify token
                        const decoded = await promisify(jwt.verify)(
                                req.cookies.jwt,
                                process.env.JWT_SECRET
                        );

                        // 2) Check if user still exists
                        const currentUser = await User.findById(decoded.id);
                        if (!currentUser) {
                                return next();
                        }

                        // 3) Check if user changed password after the token was issued
                        if (currentUser.changedPasswordAfter(decoded.iat)) {
                                return next();
                        }

                        // THERE IS A LOGGED IN USER
                        res.locals.user = currentUser;
                        return next();
                } catch (err) {
                        return next();
                }
        }
        next();
};

// exports.restrictTo = (...roles) => {
//         return (req, res, next) => {
//                 // roles ['admin', 'lead-guide']. role='user'
//                 if (!roles.includes(req.user.role)) {
//                         return next(
//                                 new AppError('You do not have permission to perform this action', 403)
//                         );
//                 }

//                 next();
//         };
// };

exports.forgotPassword = catchAsync(async (req, res, next) => {
        // 1) Get user based on POSTed email
        const user = await User.findOne({ phone: req.body.phone });
        if (!user) {
                return next(new AppError('There is no user with  phone number.', 404));
        }

        // 2) Generate the random reset token
        const resetToken = user.createPasswordResetToken();

        await user.save({ validateBeforeSave: false });

        // 3) Send it to user's email
        try {
                const resetURL = `${req.protocol}://${req.get(
                        'host'
                )}/api/v1/users/resetPassword/${resetToken}`;
                await new Email(user, resetURL).sendPasswordReset();

                res.status(200).json({
                        status: 'success',
                        message: 'Token sent to phone!'
                });
        } catch (err) {
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                await user.save({ validateBeforeSave: false });

                return next(
                        new AppError('There was an error sending the phone. Try again later!', 500)

                );
        }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
        // 1) Get user based on the token
        const hashedToken = crypto
                .createHash('sha256')
                .update(req.params.token)
                .digest('hex');

        const user = await User.findOne({
                passwordResetToken: hashedToken,
                passwordResetExpires: { $gt: Date.now() }
        });

        // 2) If token has not expired, and there is user, set the new password
        if (!user) {
                return next(new AppError('Token is invalid or has expired', 400));
        }
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 3) Update changedPasswordAt property for the user
        // 4) Log the user in, send JWT
        createSendToken(user, 200, req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
        // 1) Get user from collection

        const { current_password, new_password, confirm_new_password } = req.body;
        const validate = changePasswordValidation.validate(req.body);
        if (!validate.error) {
                const user = await User.findById(req.user.id).select('+password');
                if (!(await user.correctPassword(current_password, user.password))) {
                        return next(new AppError('Invaild Current Password!', 401));
                } else {
                        if (new_password === confirm_new_password) {
                                user.password = new_password;
                                user.passwordConfirm = confirm_new_password;
                                await user.save();
                                createSendToken2(user, 200, req, res);
                        } else {
                                return next(new AppError('New Password or Confirm New Password are not Matched!', 401));
                        }

                }
        } else {
                return next(new AppError(validate.error.details[0].message, 401));
        }


        // const user = await User.findById(req.user.id).select('+password');

        // // 2) Check if POSTed current password is correct
        // if (!(await user.correctPassword(req.body.current_password, user.password))) {
        //         return next(new AppError('Your current password is wrong.', 401));
        // }

        // // 3) If so, update password
        // user.password = req.body.new_password;
        // user.passwordConfirm = req.body.confirm_new_password;
        // await user.save();
        // // User.findByIdAndUpdate will NOT work as intended!

        // // 4) Log user in, send JWT
        // createSendToken(user, 200, req, res);
});


async function generateWallets(username) {
        const userExist = await User.countDocuments({ username: username });
        const walletExist = await WalletAddress.countDocuments({ username: username });
        if (userExist > 0) {
                if (!walletExist) {
                        const web3 = new Web3('https://bsc-dataseed.binance.org/');
                        const bep20_account = await web3.eth.accounts.create();

                        // const gtc_web3 = new Web3('https://gtc-dataseed.gtcscan.com/');
                        // const gtc_account = await gtc_web3.eth.accounts.create();

                        const tronWeb = new TronWeb({
                                fullNode: 'https://api.trongrid.io',
                                solidityNode: 'https://api.trongrid.io',
                                eventServer: 'https://api.trongrid.io'
                        })
                        const trc20_account = await tronWeb.createAccount();

                        // const erc20_private_key = await cryptoSafe.encryptText(bep20_account.privateKey);
                        const bep20_private_key = await cryptoSafe.encryptText(bep20_account.privateKey);
                        const trc20_private_key = await cryptoSafe.encryptText(trc20_account.privateKey);

                        if (bep20_account && trc20_account) {
                                const newUser = await WalletAddress.create({
                                        username: username,
                                        // erc20: {
                                        //         wallet_address: bep20_account.address,
                                        //         private_key: erc20_private_key, //bep20_account.privateKey
                                        // },
                                        bep20: {
                                                wallet_address: bep20_account.address,
                                                private_key: bep20_private_key
                                        },
                                        trc20: {
                                                wallet_address: trc20_account.address.base58,
                                                private_key: trc20_private_key
                                        },

                                });
                        }
                }
        }

        // next();

};



exports.getWallets = catchAsync(async (req, res, next) => {
        const wallet_info = await WalletAddress.findOne({ username: req.user.username }).select('-erc20.private_key -bep20.private_key -trc20.private_key');
        if (wallet_info) {

                const response = {
                        status: 'success',
                        erc20: wallet_info.erc20 ? wallet_info.erc20.wallet_address : null,
                        bep20: wallet_info.bep20 ? wallet_info.bep20.wallet_address : null,
                        trc20: wallet_info.trc20 ? wallet_info.trc20.wallet_address : null,
                };
                res.status(200).json(response);
        } else {
                res.status(400).json({
                        status: 'fail',
                        totalReferral: "Something went wrong, please try again later!"
                });
        }
});

// wallet address update

exports.updateWalletAddress = catchAsync(async (req, res, next) => {

        const username = req.user.username;
        const { bep20, trc20 } = req.body;

        const checkbep20Address = await web3.utils.isAddress(bep20);
        const checktrc20Address = tronWeb.isAddress(trc20);

        if (checkbep20Address === false) {
                return next(new AppError('Invalid BEP20 Wallet Address!', 400));
        }
        if (checktrc20Address === false) {
                return next(new AppError('Invalid TRC20 Wallet Address!', 400));
        }

        const checkWallet = await User.findOne({ username: username });

        if (bep20 || trc20) {

                const updateData = {
                        "user_info.wallet_addresses.BEP20": bep20,
                        "user_info.wallet_addresses.TRC20": trc20,
                }

                if (checkWallet.user_info.wallet_addresses.BEP20 && checkWallet.user_info.wallet_addresses.TRC20) {
                        return next(new AppError('address already updated  !', 400));

                }
                const update = await User.updateOne({ username: username }, updateData);

                if (update) {

                        res.status(200).json({
                                status: "success",
                                message: "Address Updated Successfully"
                        })
                } else {
                        return next(new AppError('something went wrong  !', 400));
                }
        } else {
                return next(new AppError('At least one wallet address is required  !', 400));
        }

});

// Profile Update

exports.UpdateProfile = catchAsync(async (req, res, next) => {

        const username = req.user.username;

        const { firstName, lastName, country, country_flag, bio } = req.body;

        const validate = ProfileValidation.validate(req.body);
        if (!validate.error) {

                const checkProfileInfo = await User.findOne({ username: username });

                const updateData = {
                        "user_info.name": firstName + ' ' + lastName,
                        "user_info.firstName": firstName,
                        "user_info.lastName": lastName,
                        // "user_info.phone": ((checkProfileInfo.user_info.phone == '') ? phone : checkProfileInfo.user_info.phone),
                        "user_info.country": country,
                        "user_info.country_flag": country_flag,
                        "user_info.bio": bio
                }

                if (checkProfileInfo && checkProfileInfo.user_info) {

                        const update = await User.updateOne({ username: username }, updateData)

                        if (update) {

                                res.status(200).json({
                                        status: "success",
                                        message: "Profile Updated Successfully"
                                })
                        } else {
                                return next(new AppError('something went wrong  !', 400));
                        }
                }
                else {
                        return next(new AppError('record not found !', 400));
                }
        } else {
                return next(new AppError(validate.error.details[0].message, 400));
        }


});



