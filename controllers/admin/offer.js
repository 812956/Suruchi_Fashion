const { OK, UNAUTHORIZED, CONFLICT } = require("../../utils/statuscodes");
const asyncHandler = require("express-async-handler");
const categoryCLTN = require('../../modles/admin/categoryModal')
const productCLTN = require('../../modles/admin/productModal')
const productVariant = require('../../modles/admin/productsVariantsMd')
const offerCLTN = require("../../modles/admin/offer");



exports.viewOffers = asyncHandler(async(req,res)=>{

    const offers = await offerCLTN.find({})

    res.status(OK).render('./admin/partials/offer/listOffers',{offers})

})


// changing the status of offer

exports.changeStatus = asyncHandler(async(req,res)=>{

    const orderId = req.params.offerId
    const {block} = req.body

    const offer = await offerCLTN.findByIdAndUpdate(orderId , { block }, { new: true });
    res.json({ success: true, message: 'Offer status updated' });

})


// deleteing offfer

exports.deleteOffer = asyncHandler (async(req,res)=>{
   
    const offerId = req.params.offerId
    const offer = await offerCLTN.findByIdAndDelete(offerId);

    res.status(OK).json({success:true})
})



exports.viewAddOffer = asyncHandler(async(req,res)=> {
     
    res.status(OK).render('./admin/partials/offer/addOffer')

})

exports.addOffer = asyncHandler(async(req,res)=>{

    console.log('hello wofjl')

    const {
        offerName,
        offerType,
        offerItems,
        discountPercentage,
        expiryDate,
      }= req.body
    
      console.log({
        offerName,
        offerType,
        offerItems,
        discountPercentage,
        expiryDate,
      })

    const nameRegex =   new RegExp(`^${offerName}$`, "i");

    isdupThere = await offerCLTN.findOne({offerName:nameRegex})

    if(isdupThere){
       return  res.status(OK).json({success:false,message:'offer with the same name found'})
    }

    if(offerType ==='Product Offer'){
         
        const isProducAvail = await productCLTN.findOne({_id:offerItems})

        if(!isProducAvail){
          return res.status(404).json({success:false,message:'no product available'})
        }

        const existingOffer = await offerCLTN.findOne({productID:offerItems}).select('_id')

        if(existingOffer){
            return res.status(CONFLICT).json({success:false,message:'Product have existing offer'})
        }

        // store the offer into database


        const savedOffer = await new offerCLTN({
            offerName,
            offerType,
            discountPercentage,
            expiryDate,
            productID:offerItems
            
        }).save()

        console.log(savedOffer )


        // update offer in product DB
        const products = await productCLTN.findByIdAndUpdate(
            offerItems,
            {$set:{offer:savedOffer._id}},
           
        )
       

        // update offer in every variant
        await productVariant.updateMany(
            {productId:offerItems},
            {$set:{offerDiscount:discountPercentage}}
        )


        return res.status(OK).json({success:true,message:'Offer added successfully'})

    }

    if(offerType ==='Category Offer'){

        iscateAvail = await categoryCLTN.findOne({_id:offerItems})

        if(!iscateAvail){
            return res.status(404).json({success:false,message:'no product available'})
        }

        const existingOffer = await offerCLTN.findOne({categoryID:offerItems}).select('_id')

        if(existingOffer){
            return res.status(CONFLICT).json({success:false,message:'category have existing offer'})
        }
        

        const savedOffer = await new offerCLTN({
            offerName,
            offerType,
            discountPercentage,
            expiryDate,
            categoryID:offerItems
            
        }).save()

        console.log(savedOffer )


        // update offer in category DB
        const categories = await categoryCLTN.findByIdAndUpdate(
            offerItems,
            {$set:{offer:savedOffer._id}},
           
        )
        console.log(categories)

        const products = await productCLTN.find({categoryId:offerItems})
        

        for(let item of products){
            item.offer = savedOffer._id

            let productVariants = await productVariant.find({productId:item._id})

            for(let item of productVariants){
                 item.offerDiscount = discountPercentage
                 await item.save()
            }
            await item.save()
        }

        return res.status(OK).json({success:true,message:'Offer added successfully'})


    }
 

    // return res.status(OK).json({success:true,message:'Offer added successfully'})

})


exports.getAllcategory = asyncHandler(async(req,res)=> {

    const categories = await categoryCLTN.find({},{_id:1,name:1})
    
    res.status(OK).json({success:true,items:categories})

})

exports.getAllproduct = asyncHandler(async(req,res)=>{

    const products = await productCLTN.find({},{_id:1,name:1})
   
    res.status(OK).json({success:true,items:products})

})


