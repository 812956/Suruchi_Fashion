const asyncHandler = require('express-async-handler')
const productCLTN = require('../../modles/admin/productModal')
const productVariantCLTN = require('../../modles/admin/productsVariantsMd')
const { OK } = require('../../utils/statuscodes')

// view productDetails page
exports.viewProductDetails = asyncHandler(async (req, res) => {

  let selectedColor = req.query.color
  console.log(req.query.color)

  const [product, variants] = await Promise.all([
    productCLTN.findOne({ _id: req.query.product, is_deleted: false }).populate('offer'),
    productVariantCLTN.find({ productId: req.query.product, is_delete: false })
  ])

  // if (!product) {
  //   return res.status(OK).redirect(`/products?category=${req.query.category}`)
  //   // return res.status(OK).redirect('/*')
  // }

  console.log('hekf ;djfkdjfkdsfkldsjfklafsdk kddjklfjaifjslkdjflksd', variants)

  let images = []
  let sizes = []

  if (selectedColor) {
    variants.forEach((variant) => {
      if (variant.color === selectedColor) {
        images = variant.images
        let availSize = []
        variant.sizes.forEach((size, index) => {
          console.log(variant.stocks[index])
          if (variant.stocks[index] !== 0) {

            availSize.push(size)
          }
        })
        sizes = availSize
        return
      }
    })
  } else {
   

    images = variants[0].images
    
    variants[0].sizes.forEach((size,index) => {
    
      if (variants[0].stocks[index] !== 0) {
        sizes.push(size)
      }
    })

    
  }

  console.log(images, sizes)


  res.status(OK).render('index/partials/productDetails', { product, variants, color: variants ? variants[0].color : '', images, sizes })

})

// getting varinat color images 
exports.getImages = asyncHandler(async (req, res) => {
  const { color, productId } = req.body

  const variantImages = await productVariantCLTN.findOne({ productId, color }, { images: 1, sizes: 1, stocks: 1 })

  res.status(OK).json({ variantImages })
})