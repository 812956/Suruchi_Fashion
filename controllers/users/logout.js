const asyncHandler = require('express-async-handler')


exports.logOut = asyncHandler(async(req,res)=>{

     res.clearCookie('jwtToken')
     res.status(200).json({success:true})

})