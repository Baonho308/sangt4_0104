const express = require('express');
const router = express.Router();
const Inventory = require('../models/inventory');

// Lấy tất cả inventory (join với product)
router.get('/', async (req, res) => {
    try {
        const inventories = await Inventory.find().populate('product');
        res.json(inventories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy inventory theo ID (join với product)
router.get('/:id', async (req, res) => {
    try {
        const inventory = await Inventory.findById(req.params.id).populate('product');
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add stock: tăng stock theo quantity
router.post('/add-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
        }

        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

        inventory.stock += quantity;
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove stock: giảm stock theo quantity
router.post('/remove-stock', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
        }

        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

        if (inventory.stock < quantity) {
            return res.status(400).json({ message: 'Không đủ stock để giảm' });
        }

        inventory.stock -= quantity;
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Reservation: giảm stock và tăng reserved theo quantity
router.post('/reservation', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
        }

        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

        if (inventory.stock < quantity) {
            return res.status(400).json({ message: 'Không đủ stock để reservation' });
        }

        inventory.stock -= quantity;
        inventory.reserved += quantity;
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Sold: giảm reserved và tăng soldCount theo quantity
router.post('/sold', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        if (!product || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'product và quantity (> 0) là bắt buộc' });
        }

        const inventory = await Inventory.findOne({ product });
        if (!inventory) return res.status(404).json({ message: 'Inventory not found' });

        if (inventory.reserved < quantity) {
            return res.status(400).json({ message: 'Không đủ reserved để sold' });
        }

        inventory.reserved -= quantity;
        inventory.soldCount += quantity;
        await inventory.save();

        res.json(inventory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
