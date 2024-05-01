const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/ProductController');

const router = express.Router();

router.post('/signup',authController.register);

router.post('/login', authController.login);

router.get('/products',  productController.Products);


module.exports = router;
