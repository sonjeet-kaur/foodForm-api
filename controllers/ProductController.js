const dotenv = require('dotenv');
const Products = require('../models/products');
const Addtocart = require('../models/addtocart');

// const image1 = require('../images/image1.jpeg');
// const image2 = require('../images/image2.jpeg');
// const image3 = require('../images/image3.jpeg');
// const image4 = require('../images/image4.jpeg');

const productsData = [
        {
                title: 'Potato',
                price: 300,
                //     image:image1,
        },
        {
                title: 'Vegitables',
                price: 500,
                //     image: image2,
        },

        {
                title: 'Cabbage',
                price: 150,
                //     image:image3,
        },

        {
                title: 'Broccoli',
                price: 800,
                //     image: image4,
        }

];

// Products.insertMany(productsData)
//         .then(() => {
//                 console.log(' data inserted successfully.');
//         })
//         .catch((error) => {
//                 console.error('Error inserting data:', error);
//         });

exports.Products = async (req, res) => {
        const products = await Products.find();
        res.json({
                status: 'success',
                data: products,
        });
}

exports.addCart = async (req, res, next) => {

        const { title, price } = req.body;
        if (title != '', price != '') {

                const userData = {
                        title: title,
                        price: price,
                }

                const newUser = await Addtocart.create(userData);
                if (newUser) {
                        res.json({
                                status: 'success',
                                message: 'added to cart successfully!'
                        });
                }
        } else {
                return next('Something went wrong', 400);
        }
}

exports.getProducts = async (req, res) => {
        const products = await Addtocart.find();
        res.json({
                status: 'success',
                data: products,
        });
}




