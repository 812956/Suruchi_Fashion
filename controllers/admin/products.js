const {OK,UNAUTHORIZED,CONFLICT,NOT_FOUND} = require('../../utils/statuscodes')
const asyncHandler = require('express-async-handler')
const productsCLTN = require('../../modles/admin/productModal')
const categoriesCLTN = require('../../modles/admin/categoryModal')
const typesCLTN = require('../../modles/admin/typeModal')
const productsVariantsCLTN = require('../../modles/admin/productsVariantsMd')
const sharp = require('sharp')



// view productManagement
exports.view = asyncHandler(async (req,res)=>{
   
    
     const [deletedProducts,products] = await Promise.all([
     productsCLTN.deleteMany({isVariantAvailable:false}),
     productsCLTN.find({}).populate({
          path:'categoryId',
          populate:{
               path:'parent',
               model:'Parents'
          } 
     }) 
     ])

     res.status(OK).render('admin/partials/products/products',{products:products?products:''})
})


//  cahnge soft Delete
exports.cahngeDelete = asyncHandler(async(req,res)=>{

     const product = await productsCLTN.findById(req.query.productId)
     
     product.is_deleted = !product.is_deleted
 
     await product.save()
    
 res.status(OK).json({success:true,productState: product.is_deleted })
 
})


// view add products
exports.viewaddProduct = asyncHandler(async (req,res)=>{
     
     await  productsCLTN.deleteMany({isVariantAvailable:false})
     const  types = await typesCLTN.find({})
   
     res.status(OK).render('admin/partials/products/addProducts',{types})
})

// add products
exports.addProduct = asyncHandler(async (req,res)=>{


    const {
     productName,
     description,
     price,
     currency,
     discount,
     brand,
     selectedTypeOptionValue,
     selectedTypeOptionText,
     selectedCategoryOptionValue,
     selectedCategoryOptionText,
     category,
     material,
     sizes}= req.body
    const regexPattern = new RegExp(`^${productName}$`,'i')
    const duplicateCheck = await productsCLTN.findOne({name:regexPattern})
    const categoryId = await categoriesCLTN.findOne({name:category},{_id:1})
      
    if(duplicateCheck){
       return res.status(CONFLICT).json({success:false,message:'Product is alerady existing !...'})
    }
    

    
    const newProduct = new productsCLTN({
     name:productName,
     description:description,
     categoryId:selectedCategoryOptionValue,
     originalPrice:parseFloat(price),
     discountPercentage:parseFloat(discount),
     currency:currency,
     brand:brand,
     material:material,
     sizes:sizes.split(','),
     // thumbnail:thumbnailImagePaths
     })

     const product = await newProduct.save()
     return res.status(OK).json({success:true,productId:product._id,message: 'Product added successfully!. Click OK to add Variants' });

})


// view edit product
exports.viewEditPage =asyncHandler(async(req,res)=>{
     
     const productData = await productsCLTN.findById(req.query.productId)
     res.status(OK).render('admin/partials/products/editProduct',{productData})

})

// edit product
exports.editProduct = asyncHandler(async(req,res)=>{
  
     
     const {name,description,currency,originalPrice,discountPercentage,sizes} = req.body   
     
    
     if(name){
          const regexPattern = new RegExp(`^${name}$`,'i')
          const duplicateCheck = await productsCLTN.findOne({name:regexPattern})
          if(duplicateCheck){
               return res.status(CONFLICT).json({success:false,message:'Product is alerady existing in this Name!...'})
           }
     }   
     
     const updateFields = {}

     if(name){
         updateFields.name = name
     }
     if(description){
         updateFields.description = description
     }
     if(originalPrice){
         updateFields.originalPrice = originalPrice
     }
     if(currency){
          updateFields.currency = currency
     }
     if(discountPercentage){
          updateFields.discountPercentage = discountPercentage
     }
     
     if(sizes){
         const product =  await productsCLTN.findOne({_id:req.query.productId})
         product.sizes = product.sizes.concat(sizes.split(','))
         await product.save()
     }
     
    
     const updatedProduct = await productsCLTN.findByIdAndUpdate(
          req.query.productId,
          {$set:updateFields},
          {new:true}
     )

     res.status(OK).json({success:true,message:'Product Updated Successfully ....'})
  
})


// view product details
exports.veiwProductDetails = asyncHandler( async(req,res)=>{
   
     console.log(req.query.productId)
      const [product,variants] = await Promise.all([
          productsCLTN.findOne({_id:req.query.productId}),
          productsVariantsCLTN.find({productId:req.query.productId})
      ])
     
    res.status(OK).render('admin/partials/products/productDetails',{product,variants})
 
})

// view add variant page
exports.viewaddVariant =  asyncHandler(async(req,res)=>{
     
     const productDetails = await productsCLTN.findOne({_id:req.query.productId},{name:1,sizes:1,isVariantAvailable:1})
     res.status(OK).render('admin/partials/products/addVariants',{productDetails})
     
})


// add variants
exports.addVariant = asyncHandler(async(req,res)=>{
     
    
     const {color,sizes,prices,stocks} = req.body
     const regexPattern = new RegExp(`^${color}$`,'i')
     const duplicateCheck = await productsVariantsCLTN.findOne({productId:req.query.productId,color:regexPattern})

     if(duplicateCheck){
       return res.status(CONFLICT).json({success:false,message:"Product variant with the same color already exists. Please choose a different color or update the existing variant."})
     }

     const productImagePaths = []
    
     for(let i=0;i<req.files.length;i++){
     
          const imagePaths = `/admin/uploads/products/${req.files[i].originalname.toLowerCase().replace(/\s+/g, '-')}_${`thumbnail${i}`}_${Date.now()}.png`
          productImagePaths.push(imagePaths)
          const processedImageBuffer = await sharp(req.files[i].buffer)
                .png({quality:90})
                .toFile(`public/${imagePaths}`)

     }
     
     const allprices = [...prices.split(',').map(x => parseFloat(x))]
     const allstocks = [...stocks.split(',').map(x => parseFloat(x))]

     // save product variant
     const newVariant = await new productsVariantsCLTN({
          productId:req.query.productId,
          sizes:sizes.split(','),
          prices:allprices,
          stocks:allstocks,
          images:productImagePaths,
          color:color,
          
     })
     
    let [variant,product] = await Promise.all([
           newVariant.save(),
           productsCLTN.findByIdAndUpdate(
           req.query.productId,
          {isVariantAvailable:true}
     )
     ])

     if(!product.thumbnail){
          await productsCLTN.findByIdAndUpdate(
              req.query.productId,
              {$set:{thumbnail:productImagePaths[0]}} 
          )
     }
     
     
     res.status(OK).json({success:true,message:'Variant added Successfully..'})
     
})



// view edit variant 
exports.vieweditVariant = asyncHandler(async(req,res)=> {

     const variantId = req.query.variantId
     const productVariant = await productsVariantsCLTN.findOne({_id:variantId}).populate({path:'productId',select:'name'})
     
     if(!productVariant){
       return res.status(NOT_FOUND).redirect('/404')
     }

     console.log(productVariant)

     res.status(OK).render('admin/partials/products/editVariant',{productVariant})

})



// edit variants
exports.editVariant = asyncHandler(async(req,res)=> {

   const {color,prices,stocks} = req.body
   const varinatId = req.query.variantId
   let productId = await productsVariantsCLTN.findOne({_id:varinatId},{productId:1})
   productId = productId.productId
   console.log(productId)

   console.log(req.body)
   console.log(req.files)

   if(color){
     const regexPattern = new RegExp(`^${color}$`,'i')
     const checkDuplicate = await productsVariantsCLTN.findOne({productId:productId,color:regexPattern})
     console.log(checkDuplicate)
    
     if(checkDuplicate){
          console.log('hello')
          return res.status(CONFLICT).json({success:false,message:"Product variant with the same color already exists. Please choose a different color or update the existing variant."})
     }

   }

   const updateFields = {}

   if(color){
     updateFields.color = color
   }

   const allprices = [...prices.split(',').map(x => parseFloat(x))]
   const allstocks = [...stocks.split(',').map(x => parseFloat(x))]

   updateFields.prices = allprices 
   updateFields.stocks = allstocks

//    const productImagePaths = []


   if(req.files.length>0){
     
     let variantImages = await productsVariantsCLTN.findOne({_id:varinatId})
     

     console.log(variantImages)

     for (const [index, file] of req.files.entries()) {
          const imagePath = `/admin/uploads/products/${file.originalname.toLowerCase().replace(/\s+/g, '-')}_thumbnail${index}_${Date.now()}.png`;
          // productImagePaths.push(imagePath);
      
              await sharp(file.buffer)
              .png({ quality: 90 })
              .toFile(`public/${imagePath}`);

           
          variantImages.images[parseInt(file.fieldname)] = imagePath

      }

      await variantImages.save()
      
   }


   const editedVariant = await productsVariantsCLTN.findByIdAndUpdate(varinatId,
     {$set:updateFields},
     {new:true}
   )


   res.status(OK).json({success:true})

})


// list unlist the varinat 

exports.ListUnlistVariant = (async(req,res)=> {

     const variantId = req.params.variantId
     console.log(variantId)

})


// delete product

exports.deleteProduct = asyncHandler(async(req,res)=>{

    await productsCLTN.deleteOne({
     $and:[
          {_id:req.query.productId},
          {isVariantAvailable:false}
     ]
    })
    res.status(OK).json({success:true})

})



