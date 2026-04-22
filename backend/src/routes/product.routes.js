const express = require('express');
const router = express.Router();
const {
    createProduct,
    getAllProducts,
    getProductById,
    getSellerProducts,
    deleteProduct
} = require('../controllers/product.controller');

// Public routes
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected/Seller routes (UserId implementation is placeholder)
router.post('/', createProduct);
router.get('/seller/:userId', getSellerProducts);
router.delete('/:id', deleteProduct);

module.exports = router;
