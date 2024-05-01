const dotenv = require('dotenv');

const mongoose = require('mongoose');

// mongoose.set('debug',true);

const productSchema = new mongoose.Schema({

        // image: {
        //         type: String,
        //         required: true
        // },
        title: {
                type: String,
                default: null
        },
        price: {
                type: Number,
                default: null
        },

},

);

const Products = mongoose.model('products', productSchema);

module.exports = Products;
