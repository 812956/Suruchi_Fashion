const mongoose = require('mongoose')

const parentSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    isDelete:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Parents',parentSchema)