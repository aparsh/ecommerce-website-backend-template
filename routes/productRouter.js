const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const Products = require('../models/products');
const Categories = require('../models/categories'); 
var url = require('url');
const authenticate = require('../authenticate');
const cors = require('./cors');

const productRouter = express.Router();
productRouter.use(bodyparser.json());



productRouter.route('/')
.get(cors.cors, (req,res,next) => {
    Products.find({})
    .populate('categories.category')
    .then((products)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(products);
    },(err) => next(err) )
    .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.veryUser, (req, res, next) => {
        if(authenticate.verifyAdmin(req.user)){
                Products.create(req.body)
                .then((product)=>{
                        console.log('Added Product : ', product);
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(product);
                },(err) => next(err) )
                .catch((err) => next(err));
        }
        else{
                err = new Error('Only admins can do that!!');
                err.statusCode = 403;
                next(err);
        }
})
.put(cors.corsWithOptions,authenticate.veryUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /products');
})
.delete(cors.corsWithOptions,authenticate.veryUser,(req, res, next) => {
        if(authenticate.verifyAdmin(req.user)){
                Products.deleteMany({})
                .then((resp)=>{
                    Categories.find({})
                    .then((categories)=>{
                        for(var i=0;i<categories.length;i++)
                        {
                            categories[i].products = [];
                        }
                    },(err) => next(err) )
                    .catch((err) => next(err));

                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(resp);
                },(err) => next(err) )
                .catch((err) => next(err));
        }
        else{
                err = new Error('Only admins can do that!!');
                err.statusCode = 403;
                next(err);
        }
});



productRouter.route('/:productId')
.get(cors.cors,(req,res,next) => {
        Products.findById(req.params.productId)
        .populate('categories.category')
        .then((product)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(product);
        },(err) => next(err) )
        .catch((err) => next(err));
})
.post(cors.corsWithOptions,authenticate.veryUser, (req, res, next) => {
    req.statusCode = 403;
    res.end('POST operation not supported on /product/'+ req.params.productId);
})
.put(cors.corsWithOptions, authenticate.veryUser, (req, res, next) => {
        if(authenticate.verifyAdmin(req.user)){
                Products.findByIdAndUpdate(req.params.productId,{
                        $set: req.body
                },{new:true})
                .then((product)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(product);
                },(err) => next(err) )
                .catch((err) => next(err));
        }
        else{
                err = new Error('Only admins can do that!!');
                err.statusCode = 403;
                next(err);
        }
        
})
.delete(cors.corsWithOptions,authenticate.veryUser, (req, res, next) => {
        if(authenticate.verifyAdmin(req.user)){
                Products.findByIdAndRemove(req.params.productId)
                .then((product)=>{
                    if(product != null  && product.categories !=null)
                    {
                        for(var i = 0;i<product.categories.length;i++)
                        {
                            Categories.findById(product.categories[i].category)
                            .then((category)=>{
                                for(var i=0;i<category.products.length;i++)
                                {
                                    if(category.products[i].product == req.params.productId)
                                    {
                                        category.products[i].remove();
                                        break;
                                    }                                    
                                }
                            },(err) => next(err) )
                            .catch((err) => next(err));
                        }
                    }
                    res.statusCode=200;
                    res.setHeader('Content-Type','application/json');
                    res.json(product);
                },(err) => next(err) )
                .catch((err) => next(err));
        }
        else{
                err = new Error('Only admins can do that!!');
                err.statusCode = 403;
                next(err);
        }   
});

module.exports = productRouter;