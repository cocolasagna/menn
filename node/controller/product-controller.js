const express = require('express');
const mongoose = require('mongoose');

const Product = require('../model/product')

const postproduct = async (req,res,next)=>{
    const product = new Product(req.body);
try{
    await product.save();
    console.log(product);
    res.status(201).json(product);
}   
catch(err){ 
    console.log(err);
    res.status(500).json({message:err.message});
    }
}

const getProduct = async(req,res,next)=>{
    try{
        const product = await Product.find()
        res.status(200).json(product)
    }
    catch(err){
        res.status(500).json({message:err.message});
    }
}

module.exports = {postproduct,getProduct}