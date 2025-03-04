const express = require('express')
const controls = require('../controller/product-controller')
const authenticateToken= require('../middleware/authmiddleware')

const ProductRouter = express.Router();

ProductRouter.post('/postproduct', controls.postproduct);
ProductRouter.get('/getproduct',authenticateToken, controls.getProduct);

module.exports = ProductRouter;