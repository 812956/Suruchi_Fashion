const User = require('../../modles/users/usersModel')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')



exports.viewSignIn = asyncHandler(async (req,res)=>{
    res.status(200).render('user/partials/signIn',{message:''});
})

exports.userSignIn = asyncHandler(async(req,res)=> {
   const {email,password} = req.body
   
   const currentUser = await User.findOne({email:email});
  
   if(currentUser && currentUser.email===email && !currentUser.password && currentUser.is_blocked===false){
     if(req.cookies&&!req.cookies.jwtToken){
           
        const userpayload = {
           userId : currentUser._id
        }

        const jwtToken = jwt.sign(userpayload,process.env.JWT_KEY)

        res.cookie('jwtToken',jwtToken,{
           httpOnly:true,
           secure: false,
           sameSite: 'strict'
        })
     
       return res.status(403).json({success:false,message:'you are signed with google !.. . Please Click google ',code:403})


     }else{
      return res.status(403).json({success:false,message:'you are signed with google!.. please signIn with google',code:403})
     }
      
   }

      
   
   if(currentUser && currentUser.is_blocked){
    return res.status(403).json({success:false,code:403,message:"Access Denied: You do not have permission to view this page. If you believe you should have access, please contact the website administrator for assistance."})
   }
  
  
   if(!currentUser){
      res.status(404).json({success:false,message:"User not found.Please craete an account",code:404});
   }
   else{
       
      isMatch = await bcrypt.compare(password,currentUser.password);
      if(!isMatch){
          res.status(401).json({success:false,message:'Invalid Password or Email',code:401});
      }
      else{
        if(!currentUser.is_verified){
           return  res.status(403).json({success:false,message:"User account not verified. Please verify your email address.",code:403})
        }
        
       if(req.cookies&&req.cookies.jwtToken){
         
        console.log(req.cookies)
        const decodedJwt= jwt.decode(req.cookies.jwtToken)
        
        const userState = await User.findByIdAndUpdate(
        decodedJwt.userId,
        {$set:{is_login:true}},
        {new:true}
        )

       }else{

         const userpayload = {
            userId : currentUser._id
         }
 
         const jwtToken = jwt.sign(userpayload,process.env.JWT_KEY)
 
         res.cookie('jwtToken',jwtToken,{
            httpOnly:true,
            secure: false,
            sameSite: 'strict'
         })

         // return res.status(403).json({success:false,code:403,message:"Access Denied: You do not have permission to view this page. If you believe you should have access, please contact the website administrator for assistance."})
       }
        
        
        res.status(200).json({success:true,message:'Login Successfull'})
        
      }
   }

})