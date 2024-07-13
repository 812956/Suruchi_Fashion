const asyncHandler = require('express-async-handler');
const { OK } = require('../../utils/statuscodes');
const addressCLTN = require('../../modles/users/addressModel');
const productCLTN = require('../../modles/admin/productModal')
const cartCLTN = require('../../modles/users/cart'); 
const productVariantCLTN = require('../../modles/admin/productsVariantsMd');
const orderCLTN = require('../../modles/users/order')
const jwt = require('jsonwebtoken');



exports.viewOrdersList = asyncHandler(async(req,res)=>{
    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    
    const orders = await orderCLTN.find({customer:userId})

    console.log(orders)
    res.status(OK).render('./user/profile/partials/ordersListing',{orders})
})