const express = require('express');
const Products = require('./routes/product');
const app = express.Router();

app.post('/product/create',Products.createProduct);

app.post('/product/show',Products.showProducts)
app.post('/order/create',Products.placeOrder)

module.exports = app;
