const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    slug: String,
    description: {
        type: String,
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categories',
        required: true,
    },
    originalPrice: {
        type: Number,
        required: true
    },
    discountPercentage: {
        type: Number,
        default: true
    },
    currency:{
        type:String,
        default:true
    },
    brand: {
        type: String,
        required: true
    },
    material: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: true
    },
    sizes: {
        type: [String],
        required: true
    },
    thumbnail: {
        type: String, 
        required: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    is_deleted:{
        type: Boolean,
        default: false
    },
    isVariantAvailable:{
        type:Boolean,
        default: false
    },
    createdDate: {
        type: Date,
        default: Date.now,  
    },
    updatedDate: {
        type: Date,
        default: Date.now
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'offerModel'

    }
});

// Middleware to generate slug before saving
productSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

module.exports = new mongoose.model("Products", productSchema);
