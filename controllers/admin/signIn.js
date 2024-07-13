const asyncHandler = require('express-async-handler')
const User = require('../../modles/users/usersModel')
const bcrypt = require('bcrypt')


// admin page rendering
exports.viewSignIn = asyncHandler(async (req,res)=> {
    res.status(200).render('./admin/partials/signIn')
})


exports.adminSignIn = asyncHandler(async (req,res,next)=> {
   
    const {email,password} = req.body
    // console.log(email,password)
    const admin = await User.findOne({email:email});

    if(!admin){
      res.status(404).json({success:false,message:'No admin found. Please enter valid credentials.',code:404})
    }else{
       isMatch = await bcrypt.compare(password,admin.password);
       if(!isMatch){
          res.status(401).json({success:false,message:'Invalid Password or Email',code:401})
       }
       else{
        if(!admin.is_admin){
            res.status(403).json({ success: false, message: 'You do not have administrative privileges.',code:403 });
        }else{
            
            req.session.admin = admin._id
            res.status(200).json({success:true})
        
        }  
       }
    }
    
})