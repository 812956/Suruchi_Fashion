const mongoose = require('mongoose');

let orderSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Types.ObjectId,
        ref: 'Users'
    },
    products: [{
        productName: {
            type: String,
            required: true
        },
        productId: {
            type: mongoose.Types.ObjectId,
            ref: 'Products',
            required: true
        },
        variantId: {
            type: mongoose.Types.ObjectId,
            ref: 'Productsvariants',
            required: true
        },
        quantity: {
            type: Number,
            default: null
        },
        variantPrice: {
            type: Number,
            required: true
        },
        variantSize: {
            type: String,
            required: true
        },
        variantColor: {
            type: String,
            required: true
        },
        orderstatus:{
            type:String,
            default:'pending'
        },
        cancelOrderStatus:{
            type:String,
            default:''
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'Refunded', 'canceled','Done'], // Define allowed values
            default: 'pending', 
        },
        subtotal:{
            type:Number,
            default: 0
        },
        reasonForReturn: {
            type: String,
            required: false
        }

    }],
    shippingAddress: {
        _id:{
          type:mongoose.Types.ObjectId,
          required:true
        },
        fullName: {
            type: String,
            required: true
        },
        mobile: {
            type: Number,
            required: true
        },
        pinCode: { 
            type: Number,
            required: true
        },
        locality: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        landMark: {
            type: String,
            required: true
        },
        altMobile: {
            type: Number,
            required: false
        }
    },
    delivered: { type: Boolean, default: false },
    modeOfPayment: String,
    subTotal: Number,
    grandTotal: Number,
    deliveryCharge: Number,
    orderStatus:{
        type:String,
        default:'pending',
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'Refunded', 'canceled','Done'], // Define allowed values
        default: 'pending',
    },
    coupon: {
        couponId: {
          type: mongoose.Schema.Types.ObjectId, 
          ref: 'Coupon' 
        },
        percentage: {
          type: Number,
        //   required: true,
          min: 0,
          max: 100
        },
        minPurchase: {
          type: Number,
          default: 0,
          min: 0
        },
        maxPurchase: {
          type: Number,
          default: 0,
          min: 0
        },
        claimedAmount: {
          type: Number,
          default: 0,
          min: 0
        }
      }
   
},{ timestamps: true });

module.exports = new mongoose.model('Orders',orderSchema)
