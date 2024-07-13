const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    userId : {
        type:mongoose.Types.ObjectId,
        ref:'users',
        required:true
    },
    products:[
        {
            productName:{
                type:String,
                required:true
            },
            productId:{
               type:mongoose.Types.ObjectId,
               ref : 'Products',
               required:true
            },
            variantId:{
                type:mongoose.Types.ObjectId,
                ref:'Productsvariants',
                required:true
            },
            quantity:{
                type:Number,
                default:1
            },
            variantPrice:{
                    type:Number,
                    required:true
            },
            variantSize:{
                type:String,
                required:true
            },
            variantColor:{
                type:String,
                required:true
            },
            subtotal:{
                type:Number,
                default:0
            }

        }
    ]
})

module.exports = new mongoose.model('Cart',cartSchema)