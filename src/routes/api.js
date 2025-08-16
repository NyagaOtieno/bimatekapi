const express = require('express');
const router = express.Router();
const productController = require('.../controllers/productController');
const quoteController = require('.../controllers/quoteController');

router.post('/products', productController.createProduct);
router.get('/products', productController.getProducts);
router.put('/products/:id', productController.updateProduct);

router.post('/quotes', quoteController.createQuote);
router.get('/quotes', quoteController.getQuotes);
router.put('/quotes/:id', quoteController.updateQuote);

module.exports = router;
