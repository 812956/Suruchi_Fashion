
const mongoose = require ('mongoose')

const wihlistSchema = new mongoose.Schema({

    userId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'userData',
        required : true
    },
    variantId :[{
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
        }

    }]
},
    {timestamps:true})

module.exports=mongoose.model('wishlist',wihlistSchema)