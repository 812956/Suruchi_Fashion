const asyncHandler = require('express-async-handler')
const {OK,CONFLICT,FORBIDDEN,NOT_FOUND} = require('../../utils/statuscodes')
const cartCLTN = require('../../modles/users/cart')
const productVariantCLTN = require('../../modles/admin/productsVariantsMd')
const productCLTN = require('../../modles/admin/productModal')
const wishList = require('../../modles/users/wishList')
const jwt = require('jsonwebtoken')

exports.view = asyncHandler(async(req,res)=>{
    const userId = jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY).userId
    const wishLists = await wishList.find({userId:userId})
    .populate("variantId.variantId");

    res.status(OK).render('./user/profile/partials/wishList',{wishLists})
})


exports.addTowishList = asyncHandler(async(req,res)=>{

    const { productName, selectedColor, selectedSize, productPrice, productId } =
    req.body;

    console.log(productName, selectedColor, selectedSize, productPrice, productId)

    const variant = await productVariantCLTN.findOne({
        productId: productId,
        color: selectedColor,
    });
    const userId = jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY).userId

    if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
    }

    const wishlistItem = await wishList.findOne({
        userId,
        'variantId': {
            $elemMatch: {
                productId: productId,
                variantId: variant._id,
                variantColor: selectedColor,
                variantSize: selectedSize,
                variantPrice: productPrice
            }
        }
    });

    console.log('there is product in here ',wishlistItem)

    if (wishlistItem) {
        return res.status(400).json({ error: 'Product is already in your wishlist' });
    }


    await wishList.findOneAndUpdate(
        {  userId: userId },
        {
            $push: {
                variantId: {
                        productName,
                        productId,
                        variantId: variant._id,
                        variantPrice: productPrice,
                        variantSize: selectedSize,
                        variantColor: selectedColor,
                        }
            }
        },
        { upsert: true }
    );


    return res.status(201).json({ message: 'Product added to wishlist successfully' });


})


exports.deleteItem = asyncHandler(async(req,res)=>{

    const { productName, selectedColor, selectedSize, productPrice, productId } =
    req.body;
    const userId = jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY).userId

    console.log(productName, selectedColor, selectedSize, productPrice, productId)
   
    const variant = await productVariantCLTN.findOne({
        productId: productId,
        color: selectedColor,
    });

    await  wishList.findOneAndUpdate(
        {userId:userId},
        {
            $pull:{variantId:{
                productName,
                productId,
                variantId: variant._id,
                variantPrice: productPrice,
                variantSize: selectedSize,
                variantColor: selectedColor,
                }}
        },
        {new:true}
    )

    res.status(OK).json({success:true})

})