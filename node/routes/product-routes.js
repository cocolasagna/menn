const express = require('express')
const controls = require('../controller/product-controller')
const authenticateToken= require('../middleware/authmiddleware')

const ProductRouter = express.Router();

ProductRouter.post('/addproduct',authenticateToken ,  controls.postproduct);
ProductRouter.get('/getproduct/:userid',authenticateToken, controls.getProduct);

module.exports = ProductRouter;