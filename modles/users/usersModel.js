const mongoose = require('mongoose')

// creating schema for user
const userSchema = new mongoose.Schema({
      fullName:{
        type:String,
        required:false
      },
      name:{
        type:String,
        required:true
      },
      email:{
        type:String,
        required:true
      },
      mobile:{
        type:Number,
        required:false
      },
      password:{
        type:String,
        required:false
      },
      photo:{
        type:String,
        required:false
      },
      is_admin:{
        type:Boolean,
        default:0,
        required:false
      },
      is_blocked:{
        type:Boolean,
        default:false
      },
      is_verified:{
        type:Boolean,
        default:false
      },
      createdAt:{
        type:Date,
        default:Date.now()
      },
      is_login: {
        type:Boolean,
        default:false
      },
      tocken:{
        type:String,
        default:''
      },
      gender:{
        type:String,
        required:false
      },
      userNameforLogged:{
        type:String,
        required:false
      }
       
   
})

// creating and exporting the model users

module.exports = new mongoose.model('Users',userSchema)