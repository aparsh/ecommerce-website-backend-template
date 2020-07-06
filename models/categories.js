const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categoryProducts = new Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product'
    }
},{
    timestamps: true
});


const CategorySchema = new Schema({
    categoryName: {
        type : String,
        required: true
    },
    products: [categoryProducts]
},{
    timestamps: true
});

module.exports = mongoose.model('category',CategorySchema);
