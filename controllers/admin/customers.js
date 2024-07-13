const asyncHandler = require('express-async-handler')
const userCLTN = require('../../modles/users/usersModel')
const {OK} = require('../../utils/statuscodes')

exports.view = asyncHandler(async (req,res)=> {
    const users= await userCLTN.aggregate([
        {$match:{is_admin:false}}
    ])
    res.status(OK).render('./admin/partials/customers/customers',{users})
})

exports.blockCustomer = asyncHandler(async(req,res)=>{
   
    const userFind = await userCLTN.findOne({_id:req.body.userId})
    
  
    userFind.is_blocked = !userFind.is_blocked
    const updatedUser = await userFind.save()
    res.status(OK).json({userState:updatedUser.is_blocked})
})

