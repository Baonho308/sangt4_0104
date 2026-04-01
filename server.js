const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const messageRoutes = require("./routes/messageRoutes");
app.use("/messages", messageRoutes);

// Connect MongoDB
mongoose.connect('mongodb://localhost:27017/');
mongoose.connection.on('connected', function () {
    console.log("connected");
});
mongoose.connection.on('disconnected', function () {
    console.log("disconnected");
});

// Routes
const productRoutes = require('./routes/product');
const inventoryRoutes = require('./routes/inventory');

app.use('/products', productRoutes);
app.use('/inventories', inventoryRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

app.use("/uploads", express.static("uploads"));