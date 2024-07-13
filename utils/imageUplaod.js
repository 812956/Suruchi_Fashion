const multer = require('multer')


// storing images uploaded in the buffer rather than in the disk sharp module will store it in the disk
const storage = multer.memoryStorage()


// filterimage
const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(console.log('Multer Filter: Must upload an image '), false)
    }
}

// callilng the multer function
const upload = multer({
    storage:storage,
    fileFilter:multerFilter
})

module.exports = upload