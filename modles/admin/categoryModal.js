const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true   
    },
    image:{
        type:String,
        required:true
       
    },
    description:{
        type:String,
        default:''
    },
    is_Active:{
        type:Boolean,
        default:true
    },
    is_delete:{
        type:Boolean, // soft deleting
        default:false
    },
    parent:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Parents',
        default:null
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    updatedAt:{
        type:Date,
        default:Date.now()
    },
    offer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'offerModel'

    }
})


module.exports =  mongoose.model('Categories',categorySchema)