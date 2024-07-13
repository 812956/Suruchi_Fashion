const asyncHandler = require('express-async-handler')
const {OK,CREATED,NOT_FOUND,UNAUTHORIZED} = require('../../utils/statuscodes')
const addressCLTN = require('../../modles/users/addressModel')
const userCLTN = require('../../modles/users/usersModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.view = asyncHandler(async(req,res)=>{

  const userId = jwt.decode(req.cookies.jwtToken).userId
 
  const [user,addressess] = await Promise.all([
    userCLTN.findOne({_id:userId}),
    addressCLTN.find({userId:userId})
  ])

  res.status(OK).render('user/profile/partials/profile',{user,addressess})

})


// edit ProfileDataGenderName 
exports.editProfileDataGenderName = asyncHandler(async(req,res)=>{
  
    const {fullName,userName,gender} = req.body
    const userId = jwt.decode(req.cookies.jwtToken).userId

    const userDataCheck = await userCLTN.findOne({_id:userId})
 
    const updatingFields = {}

    if(fullName){
      updatingFields.fullName = fullName
    }
    if(userName && userDataCheck.password){
      updatingFields.name = userName
    }
    else{
      updatingFields.userNameforLogged = userName
    }
    if(gender&&gender!=userDataCheck.gender){
      updatingFields.gender = gender
    }

    if(Object.keys(updatingFields).length==0){
      return res.status()
    }

    const updatedNameandGender = await userCLTN.findByIdAndUpdate(
      userId,
      {$set:updatingFields},
      {new:true}
    )

    res.status(OK).json({success:true,updatedNameandGender:updatedNameandGender})
   
})



// edit phone 

exports.editPhone = asyncHandler(async(req,res)=>{
    
     const {mobile} = req.body
     const userId = jwt.decode(req.cookies.jwtToken).userId

     const updatedUserbyNumber = await userCLTN.findByIdAndUpdate(
       userId,
       {$set:{mobile}},
       {new:true}
     )

     res.status(OK).json({success:true,updatedUserbyNumber})

})


// change password 

exports.changePassword = asyncHandler(async (req,res)=> {

  const {currentpass,newPassword} = req.body

  console.log('this is the admin password of th jdksljkfjal,', currentpass,newPassword)

  const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;

  const user = await userCLTN.findOne({_id:userId})
  
  const isMatch = await bcrypt.compare(currentpass,user.password)

  if(!isMatch){
    return res.status(NOT_FOUND).json({success:false,message:'Current Password is Not Correct'})
  }

  user.password = await bcrypt.hash(newPassword, 10)

  await user.save()

  res.status(OK).json({success:true,message:'Password Changed Successfully'})

})




