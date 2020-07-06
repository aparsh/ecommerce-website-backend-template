const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentsSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});


const categorySchema = new Schema({
    category : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    }
},{
    timestamps: true
});


const ProductSchema = new Schema({
    name : {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image:{
        type:String,
        required:true
    },
    label:{
        type:String,
        default:''
    },
    price:{
        type: Currency,
        required:true
    },
    categories: [categorySchema],
    featured:{
        type: Boolean,
        default:false
    },
    comments : [commentsSchema]
},{
    timestamps: true
});

var Products = mongoose.model('product',ProductSchema);

module.exports = Products;