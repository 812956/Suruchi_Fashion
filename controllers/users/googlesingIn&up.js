const asyncHandler = require('express-async-handler')
const userCLTN = require('../../modles/users/usersModel')
const {OK, CONFLICT} = require('../../utils/statuscodes')
const jwt = require('jsonwebtoken')

exports.insertUser = asyncHandler(async (req,res)=> {
 
    const {name,email} = req.body
    const regexPattern = new RegExp(`^${email}$`,'i')
    const duplicateCheck = await userCLTN.findOne({email:regexPattern})
    
    if(duplicateCheck&& duplicateCheck.email===email && duplicateCheck.name===name){
       
        if(req.cookies&&!req.cookies.jwtToken){
            
            const userId = await userCLTN.findOne({email:email})

            const userPayload = {
                userId:userId._id
            }

            const jwtToken  = jwt.sign(userPayload,process.env.JWT_KEY)

            res.cookie('jwtToken',jwtToken,{
                httpOnly:true,
                secure:false,
                sameSite: 'strict',
            })

            return res.status(OK).json({success:true})

        }
        
        return res.status(OK).json({success:true})
    }
    
   
    if(duplicateCheck){
        return res.status(CONFLICT).json({success:false,message:'Email is already in use, Login using you cridentilas'})
    }

    const GoogleVerifiedUser = await  new userCLTN({
        name,
        email,
        is_login:true,
        is_verified:true
    })
  

    const userpayload = {
        userId:GoogleVerifiedUser._id
    }
    
    const jwtToken = jwt.sign(userpayload,process.env.JWT_KEY)

    res.cookie('jwtToken',jwtToken,{
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
    })

    const savedGoogleVerifiedUser = await  GoogleVerifiedUser.save()
  
    res.status(OK).json({success:true})


})