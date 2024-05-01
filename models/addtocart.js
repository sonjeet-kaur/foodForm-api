const dotenv = require('dotenv');

const mongoose = require('mongoose');

const addtocartSchema = new mongoose.Schema({

        image: {
                type: String,
                index: true,
        },
        title: {
                type: String,
                default: null
        },
        price: {
                type: Number,
                default: null
        },
},
)

const Addtocart = mongoose.model('addtocart', addtocartSchema);

module.exports = Addtocart;
