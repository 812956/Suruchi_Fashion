
const asyncHandler = require('express-async-handler');
const { OK } = require('../../utils/statuscodes');
const addressCLTN = require('../../modles/users/addressModel');
const productCLTN = require('../../modles/admin/productModal')
const cartCLTN = require('../../modles/users/cart'); 
const productVariantCLTN = require('../../modles/admin/productsVariantsMd');
const orderCLTN = require('../../modles/users/order')
const walletCLTN = require('../../modles/users/wallet')
const jwt = require('jsonwebtoken');



exports.view = asyncHandler(async(req,res)=>{

    const userId = jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY).userId
    const wallet = await walletCLTN.findOne({userID:userId})
    console.log(wallet)
    res.status(OK).render('./user/profile/partials/wallet',{wallet})

})