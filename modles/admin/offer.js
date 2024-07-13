const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({

    offerName:{
       type:String,
       required:true 
    },

    offerType:{
        type:String,
        enum: ['Category Offer','Product Offer'],
        required:true
    },

    discountPercentage:{
        type:Number,
        required:true
    },

    block: {
        type: Boolean,
        default: false
    },

    expiryDate: {
        type: String,
        required: true
    },

    productID:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product',
            required:false
        }
    ,
    categoryID:
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'catogoryModel',
            required:false
        }
    ,
   


},{timestamps:true})

module.exports = mongoose.model('offerModel',offerSchema);