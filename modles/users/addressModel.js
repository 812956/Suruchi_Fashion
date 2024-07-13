const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
    fullName:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    pinCode:{
        type:Number,
        required:true
    },
    locality:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    city:{
        type:String,
        required:true
    },
    state:{
        type:String,
        reqired:true
    },
    landMark:{
        type:String,
        required:true
    },
    altMobile:{
        type:Number,
        required:false
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    }
    
})


module.exports = new mongoose.model('addresses',addressSchema)