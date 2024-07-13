const {INTERNAL_SERVER_ERROR} = require('../utils/statuscodes')

exports.errorHandler = (err,req,res,next)=> {
    let statusCode = err.statusCode || INTERNAL_SERVER_ERROR
    let message = err.message || 'Internal Server Error'

    // loging the error
console.log(err.stack)

res.status(500).redirect('/404')
// res.status(statusCode).json({
//     // success:false,
//     // message:message
// })
}




