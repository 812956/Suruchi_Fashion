const asyncHandler = require('express-async-handler')
const categoriesCLTN = require('../../modles/admin/categoryModal')
const typeCLTN = require('../../modles/admin/typeModal')
const {OK,CONFLICT,NOT_FOUND}= require('../../utils/statuscodes')


exports.view = asyncHandler(async(req,res)=>{
    
     const categories = await categoriesCLTN.find({}).populate('parent')

    if(categories.length>0){
        
        res.status(200).render('admin/partials/categories/categories',{categories})
   }else{
        res.status(404).render('admin/partials/categories/categories',{categories:'',message:'No Categories added'})
   }
     
})

// view addCategory page
exports.viewaddCategory =asyncHandler( async(req,res)=>{

        const types = await typeCLTN.find({}).select('name _id')
        
        res.status(200).render('admin/partials/categories/addCategory',{types})
})

// add Category
exports.addCategory = asyncHandler(async(req,res)=>{
   
         
       const  {name, description,parent} = req.body
       const regexPattern = new RegExp(`^${name}$`,'i')
       const duplicateCheck = await categoriesCLTN.findOne({name:regexPattern,parent:parent})
       
       const imagePath =  `/admin/uploads/category/${req.file.filename}`

       if(duplicateCheck){
        res.status(409).json({ success: false, message: 'Category already exists' });
       }else{
        
           const newCategory = new categoriesCLTN({
                name:name,
                image:imagePath,
                description: description,
                parent:req.body.parent?req.body.parent:null
           })
           
           await newCategory.save()

           res.status(200).json({ success: true, message: 'Category added successfully. Click Back to view updates.' });
       }
})

exports.edit = asyncHandler(async(req,res)=>{
     
   
     const {name,oldname,description} = req.body
     const regexPattern = new RegExp(`^${name}$`,'i')
     const duplicateCheck  = await categoriesCLTN.findOne({name:regexPattern})

     
     if(duplicateCheck){
          res.status(409).json({ success: false, message: 'Category already exists, Give an another Name' });
          
     }else{
          const updateFields = {}
     
          if(req.body.name){
               updateFields.name = name
          }  
          if(req.file){
             updateFields.image = `/admin/uploads/category/${req.file.filename}`
          }
          if(req.body.description){
               updateFields.description = description
          }   
         
          const updatedCategory = await categoriesCLTN.findOneAndUpdate(
          {name:oldname},
          {$set:updateFields},
          {new:true}
          )
         
         res.status(200).json({success:true})
     
     }
    
})

// soft delete

exports.softDelete = asyncHandler(async(req,res)=>{
      
    const currentStatus = await categoriesCLTN.findOne({_id:req.params.id})
    const deleteCategory = await categoriesCLTN.findByIdAndUpdate(
     req.params.id,
     {$set:{is_delete:currentStatus.is_delete?false:true}},
     {new:true}
    ) 

    if(deleteCategory){
      res.status(200).json({success:true,categoryStatus:deleteCategory.is_delete})
    }else{
     res.status(500).json({})
    }
     
})


// view Types page
exports.viewTypes = asyncHandler(async(req,res)=>{
     const types = await typeCLTN.find({})
     
     if(types.length>0){
        return res.status(OK).render('admin/partials/categories/types',{types})
     }

     return res.status(NOT_FOUND).render('admin/partials/categories/types',{types:'',message:'No Types added'})
})

// view addType
exports.viewaddType = asyncHandler(async(req,res)=>{
      res.status(OK).render('admin/partials/categories/addType')
})


// add type
exports.addType = asyncHandler(async(req,res)=>{
     
     const {name} = req.body
     regexPattern = new RegExp(`^${name}$`,'i')
     const duplicateCheck = await typeCLTN.findOne({name:regexPattern})

     if(duplicateCheck){
          return res.status(CONFLICT).json({success:false,message:'Type is already Existsing!..'})
     }

     const type = new typeCLTN({
          name
     })

     const savedType = await type.save()
     return res.status(OK).json({success:true,message:'Type is added Successfully!...'})

})

// edit type

exports.editType = asyncHandler(async(req,res)=>{
     
     const {name,oldname} = req.body
     regexPattern = new RegExp(`^${name}$`,'i')
     const duplicateCheck = await typeCLTN.findOne({name:regexPattern})

     if(duplicateCheck){
          return res.status(CONFLICT).json({success:false,message:'Type is already Existing !..'})
     }
      
     const updatedType = await typeCLTN.findOneAndUpdate(
      {name:oldname},
      {$set:{name:name}},
      {new:true}
     )
     
     res.status(OK).json({success:true,message:'Type is Edited Successfully...'})
})

// soft delete type

exports.softDeleteType = asyncHandler(async(req,res)=>{
     
     const type = await typeCLTN.findOne({_id:req.params.id})

     type.isDelete = !type.isDelete

     const updatedType = await type.save()

     res.status(OK).json({success:true,typeStatus:updatedType.isDelete})

})


// fetch for add product wich gives category data by type 
exports.getCategoriesByType = asyncHandler(async(req,res)=>{
    
     const categories = await  categoriesCLTN.find({parent:req.query.id})
    
    if(categories.length==0){
     return res.status(NOT_FOUND).json({success:false,message:'No category added In this Type!..Click Ok to add a category'})
    }
     
    res.status(OK).json({success:true,categories})
})


exports.getDescription = asyncHandler(async (req,res)=>{
     
     
     const description = await categoriesCLTN.findOne({_id:req.params.categoryId},{_id:0,description:1})
     
     res.status(OK).json({description:description})
     
})
