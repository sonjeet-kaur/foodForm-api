const dotenv = require('dotenv');

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const randomGenerate = require('otp-generator');

const generate = async (numbers) => {
        return await randomGenerate.generate(numbers, { alphabets: false, upperCase: false, specialChar: false });
};

const signToken = async (id) => {
        return await jwt.sign({ id }, process.env.JWT_SECRET, {
                expiresIn: process.env.JWT_EXPIRES_IN
        });
};

const generateUserId = async () => {
        let username = await generate(8);
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

exports.register = async (req, res, next) => {

        const { email, password, phone } = req.body;
        let username = await generateUserId();
        if (email != '', password != '') {

                const checkEmail = await User.countDocuments({ email: email.toLowerCase() });
                if (checkEmail > 0) {
                        return next('E-Mail Address already exists!', 400);
                }
                const userData = {
                        username: username,
                        password: password,
                        email: email.toLowerCase(),
                        phone: phone
                }

                const newUser = await User.create(userData);
                if (newUser) {

                        createSendToken(newUser, "Registration", 200, req, res);
                }
        } else {
                return next('Something went wrong', 400);
        }
}

exports.login = async (req, res, next) => {
        try {
            console.log('req.body', req.body);
            const { email, password } = req.body;
    
            if (!email || !password) {
                return next('Email and password are required.', 400);
            }
    
            const user = await User.findOne({ email });

            if (!user || user.password !== password) {
                return next('Invalid email or password.', 401);
            }

            createSendToken(user, "Login", 200, req, res);
        } catch (error) {
            console.error('Error in login:', error);
            return next('Something went wrong.', 500);
        }
    };




