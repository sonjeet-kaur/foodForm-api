const dotenv = require('dotenv');

const crypto = require('crypto');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// mongoose.set('debug',true);

const INCOME_STRUCT = {
        referral_income: {
                type: Number,
                default: 0
        },
        roi_income: {
                type: Number,
                default: 0
        },
        roi_level_income: {
                type: Number,
                default: 0
        },
        royalty_income: {
                type: Number,
                default: 0
        },
        global_lifetime_pool_income: {
                type: Number,
                default: 0
        },
        booster_income: {
                type: Number,
                default: 0
        },


}

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
        sponsor_id: {
                type: String,
                required: [true, 'Sponser ID Feild is required!']
        },
        wallet_address: {
                type: String,
                default: null
        },
        passport: {
                type: String,
                default: null
        },
        business: {
                direct_business: {
                        type: Number,
                        default: 0
                },
                team_business: {
                        type: Number,
                        default: 0
                },
        },
        directs: {

                total: {
                        type: Number,
                        default: 0
                },
                active: {
                        type: Number,
                        default: 0
                },
                inactive: {
                        type: Number,
                        default: 0
                },
        },


        ref_id:
        {
                type: Array,
                username: {
                        type: String,
                        default: null
                },
                active_status: {
                        type: Boolean,
                        default: false
                },
        },

        active_status: {
                type: Boolean,
                default: false
        },

        disable: {
                type: Boolean,
                default: false
        },

        withdraw_status: {
                type: Boolean,
                default: true
        },


        income_info: INCOME_STRUCT,

        user_info: {
                name: {
                        type: String,
                        default: null
                },
                firstName: {
                        type: String,
                        default: null
                },
                lastName: {
                        type: String,
                        default: null
                },
                phone: {
                        type: String,
                        default: ''
                },
                email: {
                        type: String,
                        default: null
                },
                dob: {
                        type: String,
                        default: null
                },
                passport: {
                        type: String,
                        default: null
                },
                activate_date: {
                        type: Date,
                        default: null
                },

                upgrade_date: {
                        type: Date,
                        default: null
                },
                package: {
                        current_package: {
                                type: Number,
                                default: 0
                        },
                        previous_package: {
                                type: Number,
                                default: 0
                        },
                        total_package: {
                                type: Number,
                                default: 0
                        },

                },
                income_limit: {
                        type: Number,
                        default: 0
                },
                income_earn: {
                        type: Number,
                        default: 0
                },
                sponsor_id: {
                        type: String,
                        required: [true, 'Sponser ID Feild is required!']
                },
                wallet_addresses: {
                        ERC20: {
                                type: String,
                                // trim: true,
                                // required: [true, 'ERC20 Wallet Address is Required!'],
                                default: null
                        },
                        BEP20: {
                                type: String,
                                // trim: true,
                                // required: [true, 'BEP20 Wallet Address is Required!'],
                                default: null
                        },
                        TRC20: {
                                type: String,
                                // trim: true,
                                // required: [true, 'TRC20 Wallet Address is Required!'],
                                default: null
                        },

                },
                rank: {
                        type: Number,
                        default: 0
                },
                country: {
                        type: String,
                        default: ''
                },
                bio: {
                        type: String,
                        default: null
                },
                country: {
                        type: String,
                        default: null
                },
                country_flag: {
                        type: String,
                        default: null
                },

        },
        bank_info: {
                bank_name: {
                        type: String,
                        default: null
                },
                account_holder_name: {
                        type: String,
                        default: null
                },
                account_number: {
                        type: Number,
                        default: null
                },
                ifsc: {
                        type: String,
                        default: null
                },
                upi_id: {
                        type: String,
                        default: null
                }
        },

        security_type: {
                type: String,
                enum: ['none', '2fa', 'other'],
                default: 'none'
        },
        verified: {
                type: Boolean,
                default: false
        },
        expiration_time: Date,
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        active: {
                type: Boolean,
                default: true,
                select: false
        }
},
        {
                timestamps:
                {
                        createdAt: 'created_at',
                        updatedAt: 'updated_at'
                }
        });

userSchema.pre('save', async function (next) {
        // Only run this function if password was actually modified
        this.updated_at = Date.now();
        if (!this.isModified('password')) return next();

        // Hash the password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);

        // Delete passwordConfirm field
        this.passwordConfirm = undefined;
        next();
});

userSchema.pre('save', function (next) {
        if (!this.isModified('password') || this.isNew) return next();

        this.passwordChangedAt = Date.now() - 1000;
        next();
});

userSchema.pre(/^find/, function (next) {
        // this points to the current query
        this.find({ active: { $ne: false } });
        next();
});

userSchema.methods.correctPassword = async function (
        candidatePassword,
        userPassword
) {
        return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
        if (this.passwordChangedAt) {
                const changedTimestamp = parseInt(
                        this.passwordChangedAt.getTime() / 1000,
                        10
                );

                return JWTTimestamp < changedTimestamp;
        }

        // False means NOT changed
        return false;
};

userSchema.methods.createPasswordResetToken = function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        this.passwordResetToken = crypto
                .createHash('sha256')
                .update(resetToken)
                .digest('hex');

        // console.log({ resetToken }, this.passwordResetToken);

        this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

        return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
