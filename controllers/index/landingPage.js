const asyncHandler = require('express-async-handler')
const {OK} = require('../../utils/statuscodes')
const productCLTN = require('../../modles/admin/productModal')
const categoriesCLTN = require('../../modles/admin/categoryModal')

// rendering Landing page
exports.viewLandingPage = asyncHandler(async (req,res)=>{
          

      const [men,women] = await Promise.all([
            categoriesCLTN.find({is_delete:false,parent:'662f6a062691f6da78d9d0c3'}).populate('parent'),
            categoriesCLTN.find({is_delete:false,parent:'662f82ed1c7bf5cc845b4ad1'}).populate('parent')
      ])
     
       res.status(OK).render('index/partials/landingPage',{men,women})  
})

