const express = require('express');
const Products = require('./routes/product');
const app = express.Router();

app.post('/product/create',Products.createProduct);

app.get('/product/list',Products.listAllProduct);

app.post('/order/create',Products.placeOrder)

module.exports = app;
