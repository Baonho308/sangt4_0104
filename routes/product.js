const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const Inventory = require('../models/inventory');

// Tạo product mới -> tự động tạo inventory tương ứng
router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();

        // Tạo inventory tương ứng cho product
        const inventory = new Inventory({ product: product._id });
        await inventory.save();

        res.status(201).json({ product, inventory });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Lấy tất cả products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy product theo ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
