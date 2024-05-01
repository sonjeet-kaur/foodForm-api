const dotenv = require('dotenv');

const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// mongoose.set('debug',true);

const userSchema = new mongoose.Schema({

        username: {
                type: String,
                index: true,
                required: [true, 'Username Feild is required!']
        },
        email: {
                type: String,
                default: null
        },
        phone: {
                type: Number,
                default: null
        },
        password: {
                type: String,
                default: ''
        },

},
//         {
//                 timestamps:
//                 {
//                         createdAt: 'created_at',
//                         updatedAt: 'updated_at'
//                 }
//         }
);

userSchema.methods.correctPassword = async function (
        candidatePassword,
        userPassword
) {
        return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
