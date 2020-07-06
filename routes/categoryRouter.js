const express = require('express');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const Category = require('../models/categories');
const Products = require('../models/products');
var url = require('url');
const authenticate = require('../authenticate');
const cors = require('./cors');

const categoryRouter = express.Router();
categoryRouter.use(bodyparser.json());


categoryRouter.route('/')
.get(cors.cors, (req,res,next)=>{
    Category.find({})
    .populate('products.product')
    .then((categories)=>{
        console.log(categories);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(categories);
    },(err) => next(err) )
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.veryUser,authenticate.verifyAdminInLine,(req,res,next)=>{
    Category.findOne({categoryName : req.body.name})
    .then((category)=>{
        if(category==null){
            Category.create({categoryName : req.body.name})
            .then((category)=>{
                category.products=[];
                for(var i = 0; i < req.body.products.length; i++)
                {
                    category.products.push({product : req.body.products[i].id});
                    Products.findById(req.body.products[i].id)
                    .then((product)=>{
                        if(product!=null)
                        {
                            if(product.categories==null)
                            { product.categories=[]; } 
                            product.categories.push({category : category._id});
                            product.save();
                        }
                        console.log(product);
                    },(err) => next(err))
                    .catch((err) => next(err));
                }
                category.save()
                .then((category)=>{
                    res.statusCode = 200;
                    res.setHeader('Content-Type' , 'application/json');
                    res.json(category);
                },(err) => next(err))
                .catch((err) => next(err));
            },(err) => next(err))
            .catch((err) => next(err));
        }
        else{
            for(var i = 0; i < req.body.length; i++)
            {
                var index = -1;
                for(var j = 0; j<category.products.length;j++)
                {
                    if(category.products[j].product = req.body.products[i].id)
                    {
                        index=j;
                        break;
                    }
                }
                if(index==-1)
                {
                    category.products.push({product : req.body.products[i].id});
                    Products.findById(req.body.products[i].id)
                    .then((product)=>{
                        if(product!=null)
                        {
                            if(product.categories==null)
                            { product.categories=[]; } 
                            product.categories.push({category : category._id});
                            product.save();
                        }
                    },(err) => next(err))
                    .catch((err) => next(err));
                }
            }
            category.save()
            .then((category)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(category);
            },(err) => next(err))
            .catch((err) => next(err));
        }
    },(err) => next(err) )
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.veryUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /category');  
})
.delete(cors.corsWithOptions, authenticate.veryUser, (req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        Category.findOneAndRemove({categoryName : req.body.name})
        .then((resp)=>{
            Products.find({})
            .then((products)=>{
                for(var i=0;i<products.length;i++)
                {
                    products[i].categories=[];
                    products[i].save();
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


categoryRouter.route('/:categoryId')
.get(cors.cors, (req,res,next)=>{
    Category.findOne({categoryName : req.params.CategoryId})
    .populate('products.product')
    .then((products)=>{
        console.log(products);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(products);
    },(err) => next(err) )
    .catch((err) => next(err));
})
.post(cors.corsWithOptions, authenticate.veryUser,authenticate.verifyAdminInLine,(req,res,next)=>{
    Category.findById(req.params.CategoryId)
    .then((category)=>{
        for(var i = 0; i < req.body.length; i++)
            {
                var index = -1;
                for(var j = 0; j<category.products.length;j++)
                {
                    if(category.products[j].product = req.body.products[i].id)
                    {
                        index=j;
                        break;
                    }
                }
                if(index==-1)
                {
                    category.products.push({product : req.body.products[i].id});
                }
            }
            category.save()
            .then((category)=>{
                res.statusCode = 200;
                res.setHeader('Content-Type' , 'application/json');
                res.json(category);
            },(err) => next(err))
            .catch((err) => next(err))
        },(err) => next(err))
    .catch((err) => next(err));
})
.put(cors.corsWithOptions, authenticate.veryUser, (req,res,next)=>{
    res.statusCode = 403;
    res.end('PUT operation not supported on /category/'+req.params.CategoryId);  
})
.delete(cors.corsWithOptions, authenticate.veryUser, (req,res,next)=>{
    if(authenticate.verifyAdmin(req.user)){
        Category.findByIdAndDelete(req.params.CategoryId)
        .then((category)=>{
            for(var i=0;i<category.products.length;i++)
            {
                Products.findById(category.products[i].product)
                .then((product)=>{
                    if(product!=null && product.categories!=null)
                    {
                        for(var j=0;j<product.categories.length;j++){
                            if(product.categories[i].category == req.params.CategoryId)
                            {
                                product.categories[i].remove();
                                break;
                            }
                        }
                        product.save();
                    }
                },(err) => next(err))
                .catch((err) => next(err)); 
            }

            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(category);
        },(err) => next(err) )
        .catch((err) => next(err));  
    }
    else{
        err = new Error('Only admins can do that!!');
        err.statusCode = 403;
        next(err);
    }  
});


categoryRouter.route('/:categoryId/products/:productId')
.delete(cors.corsWithOptions,authenticate.veryUser, (req, res, next) => {
    Category.findById(req.params.categoryId)
    .then((category)=>{
            if(category != null && category.products!=null)
            {
                Products.findById(req.params.productId)
                .then((product)=>{
                    if(product!=null && product.categories!=null)
                    {
                        for(var j=0;j<product.categories.length;j++){
                            if(product.categories[i].category == req.params.CategoryId)
                            {
                                product.categories[i].remove();
                                break;
                            }
                        }
                        product.save();
                    }
                },(err) => next(err) )
                .catch((err) => next(err));

                var index = -1;
                for(var i=0;i<category.products.length;i++)
                {
                    if(category.products[i].product==req.params.dishId)
                    {
                        index = i;
                        break;
                    }
                }
                    if(index>=0)
                    {
                        category.products.splice(index,1);
                        category.save()
                        .then((category)=>{
                            res.statusCode = 200;
                            res.setHeader('Content-Type' , 'application/json');
                            res.json(category);
                        },(err) => next(err))
                        .catch((err) => next(err));
                    }
                    else{
                        err = new Error('Not in the list'); 
                        err.statusCode = 404;
                        next(err); 
                    }
            }
            else if(category == null)
            {
                    err = new Error('Dish ' + req.params.dishId + ' notfound');
                    err.statusCode = 404;
                    next(err);
            }
            else
            {
                    err = new Error('Comment ' + req.params.commentId + ' notfound');
                    err.statusCode = 404;
                    next(err);
            }
    },(err) => next(err) )
    .catch((err) => next(err));
});

module.exports = categoryRouter;