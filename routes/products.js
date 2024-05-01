const express = require('express');
const productController = require('../controllers/ProductController');

const router = express.Router();

router.get('/products',  productController.Products);
router.get('/getproducts',  productController.getProducts);
router.post('/addtocart',  productController.addCart);

module.exports = router;
