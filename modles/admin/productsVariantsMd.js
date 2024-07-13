const mongoose = require('mongoose')

const variantShcema = new mongoose.Schema({
    productId: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'Products',
        required:true,
    },
    sizes:{
        type:[String],
        required:true
    },
    prices:{
       type:[Number],
       required:true
    },
    stocks:{
        type:[Number],
        required:true
    },
    images:{
        type:[String],
        required:true,
    },
    is_delete:{
      type:Boolean,
      default:false
    },
    color:{
        type:String,
        required:true
    },
    createdDate:{
        type:Date,
        default:Date.now()
    },
    updatedDate:{
        type:Date,
        default:Date.now()
    },
    offerDiscount:{
        type:Number      
    }
})

module.exports = new mongoose.model('Productsvariants',variantShcema)