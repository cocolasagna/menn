const express = require('express');
const mongoose = require('mongoose');
const Product = require('../model/product')



const postproduct = async (req, res, next) => {
    try {
        if(!req.body.productname){
            return res.status(400).json({message: "Product name is required"})
        }else if (!req.body.productprice){
            return res.status(400).json({message: "Product price is required"})
        }

        
        const name = req.body.productname
        const price = req.body.productprice

     // const product = new Product({ ...req.body, user: req.user.id });
     const product = new Product({ name, price , user: req.user.id });
      await product.save();
      console.log(product);
      res.status(201).json({message:"Product added successfully",product});
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }
  };
  

  const getProduct = async (req, res, next) => {
    try {
      // Ensure the userId from params is in the correct format (ObjectId)
      const userId = req.params.userid;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required." });
      }
  
      // Query the products by user ID
      //const products = await Product.find({ user: userId }).populate('user', 'name email -_id');
      const products = await Product.find({user:userId}, '-user')
      if (!products || products.length === 0) {
        return res.status(404).json({ message: "No products found for this user." });
      }
  
      // Return the products
      res.status(200).json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: err.message });
    }
  };


module.exports = {postproduct,getProduct}