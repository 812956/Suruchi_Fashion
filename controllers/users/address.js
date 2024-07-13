const asyncHandler = require('express-async-handler')
const {OK,CREATED,CONFLICT} = require('../../utils/statuscodes')
const addressCLTN = require('../../modles/users/addressModel')
const userCLTN = require('../../modles/users/usersModel')
const jwt = require('jsonwebtoken')


// add address
exports.addAddress = asyncHandler(async(req,res)=>{
   
    const userId = jwt.decode(req.cookies.jwtToken).userId
    const {fullname,mobile,altmobile,locality,address,City,landmark,userState,postCode} = req.body
     

    const duplicateCheck = await addressCLTN.findOne({
     pinCode:postCode,
     locality:{$regex:new RegExp(locality,'i')},
     address:{$regex:new RegExp(address,'i')},
     userId:userId
    })


    if(duplicateCheck){
        return res.status(CONFLICT).json({success:false,message:'A similar address already exists. Please check your entry.'})
    }
    
    const storingAddress = {
        fullName:fullname,
        mobile:mobile,
        pinCode:postCode,
        locality:locality,
        address:address,
        city:City,
        state:userState,
        landMark:landmark,
        userId : userId
    }

    if(altmobile){
        storingAddress.altMobile = altmobile
    }
    
    const newAddress = new addressCLTN(storingAddress)
    const savedAddress = await newAddress.save()
    const userEmail = await userCLTN.findOne({_id:userId},{_id:0,email:1})

    res.status(OK).json({success:true,savedAddress,userEmail})
 
 })


// edite address 
exports.editAddress = asyncHandler(async(req,res)=>{
    
    const userId = jwt.decode(req.cookies.jwtToken).userId
    const {fullName,mobile,altMobile,locality,address,city,landMark,state,postCode,addresId} = req.body
   
   const oldData = await addressCLTN.findOne({_id:addresId})
   if(state == oldData.state && Object.keys(req.body).length ==2){
    return res.status(CONFLICT).json({success:false,message:'You didn\'t update any field. Please make sure to update at least one field before submitting.'})
   }

   const updateObj = {}
  
   const nameRegex = new RegExp(`^${fullName}$`,'i')
   if(fullName && !nameRegex.test(oldData.fullName)){
    updateObj.fullName = fullName
   }else if(fullName&&nameRegex.test(oldData.fullName)){
    return res.status(CONFLICT).json({success:false,message:'A similar name already exists. Please check your entry.'})
   }
   
   if(mobile && mobile!=oldData.mobile){
    updateObj.mobile = mobile
   }
   else if(mobile && mobile==oldData.mobile){
    return res.status(CONFLICT).json({success:false,message:'A similar mobile already exists. Please check your entry.'})
   }

   if(altMobile && altMobile!=oldData.altMobile){
    updateObj.altMobile = altMobile
   }else if(altMobile && altMobile==oldData.altMobile){
    return res.status(CONFLICT).json({success:false,message:'A similar altmobile already exists. Please check your entry.'})
   }
   
   const localityRegex = new RegExp(`^${locality}$`,'i')
   if(locality && !localityRegex.test(oldData.locality) ){
    updateObj.locality= locality
   }else if(locality && localityRegex.test(oldData.locality) ){
    return res.status(CONFLICT).json({success:false,message:'A similar locality already exists. Please check your entry.'})
   }
   
    const addressRegex = new RegExp(`^${address}$`, 'i');
    if (address && !addressRegex.test(oldData.address)) {
        updateObj.address = address;
    }else if(address && addressRegex.test(oldData.address)){
        return res.status(CONFLICT).json({success:false,message:'A similar address already exists. Please check your entry.'})
        }
   
    const cityRegex = new RegExp(`^${city}$`, 'i');
    if (city && !cityRegex.test(oldData.city)) {
        updateObj.city = city;
    }else if(city && cityRegex.test(oldData.city)){
        return res.status(CONFLICT).json({success:false,message:'A similar city already exists. Please check your entry.'})
        }
    
    const landMarkRegex = new RegExp(`^${landMark}$`, 'i');
    if (landMark && !landMarkRegex.test(oldData.landMark)) {
        updateObj.landMark = landMark;
    }else if(landMark && landMarkRegex.test(oldData.landMark)){
        return res.status(CONFLICT).json({success:false,message:'A similar landMark already exists. Please check your entry.'})
        }
    

   if(postCode && postCode!=oldData.pinCode){
    updateObj.pinCode = postCode
   }else if(postCode && postCode==oldData.pinCode){
    return res.status(CONFLICT).json({success:false,message:'A similar pinCode already exists. Please check your entry.'})
    }

 
    
   const edited =  await addressCLTN.findByIdAndUpdate(
    addresId,
    {$set:updateObj},
    {new:true}
   )

  res.status(OK).json({success:true,edited})


})

// delete address
exports.deleteAddress = asyncHandler(async(req,res)=>{

    await addressCLTN.deleteOne({_id:req.query.addressId})

    res.status(OK).json({success:true})

})

 