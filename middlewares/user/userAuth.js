const userCLTN = require('../../modles/users/usersModel')
const jwt = require('jsonwebtoken')
const {OK, CONFLICT} = require('../../utils/statuscodes')

exports.is_login = async (req,res,next) => {
  try {
  
    //   if(req.cookies.jwtToken!=undefined){
        if(req.cookies&&req.cookies.jwtToken){

         const userId = jwt.decode(req.cookies.jwtToken).userId
         
         const userStatus = await userCLTN.findOne({_id:userId})

         if(userStatus&&userStatus.is_verified === false && userStatus.is_blocked === false && userStatus.is_login=== false){
              next()
         }
         else if(userStatus&&userStatus.is_verified && userStatus.is_blocked === false && userStatus.is_login === true){ 
              res.redirect('/')
         }
         else if(userStatus&&userStatus.is_verified && userStatus.is_blocked === false && userStatus.is_login === false){
            next()
         }
         else if(userStatus&&userStatus.is_verified && userStatus.is_blocked === true && userStatus.is_login === true){
          next()
         }
         else{
            res.redirect('/signIn')
            // res.redirect('/signUP')
         }

      }else{
      next()
      }

  } catch (error) {
    console.log(error.message)
  }
}


exports.is_notBlocked = async (req,res,next)=>{
     try{
    
        if(req.cookies&&req.cookies.jwtToken){
         
            const userId = jwt.decode(req.cookies.jwtToken).userId

            const userStatus = await userCLTN.findOne({_id:userId})

            if(userStatus&&userStatus.is_blocked === false){
                next()
            }else{
                res.redirect('/signIn')
            }

        }else{
            next()
        }

     }catch(error){
        console.log(error)
     }
}


exports.isLoggedInd = async(req,res,next)=>{
   
    if(req.cookies && req.cookies.jwtToken){
        const userId = jwt.decode(req.cookies.jwtToken).userId
        const userStatus = await userCLTN.findOne({_id:userId})
        if(userStatus&&userStatus.is_login ){
            res.redirect('/')
        }else if(userStatus&&userStatus.is_verified&&!userStatus.is_login){
            res.redirect('/signIn')
        }
        else{
            next()
        }
    }else{
        
        next()
    }

    
}

exports.isProfileAllowed = async (req,res,next)=>{
   
    try {

        if(req.cookies&&req.cookies.jwtToken){
         
            const userId = jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY).userId

            const userStatus = await userCLTN.findOne({_id:userId})
            
            if(userStatus&&userStatus.is_blocked === false ){
                next()
            }else{
               
                res.redirect('/signIn')
            }

        }else{
            res.redirect('/signIn')
        }
        
    } catch (error) {
        console.log(error)
    }
}


exports.isjwTavailable = async(req,res,next) => {
      
    try {

        if(req.cookies && !req.cookies.jwtToken){


          res.status(404).json({})  
        }else{
            next()
        }
        
    } catch (error) {
        console.log(error)
    }
}



exports.notBlocked_haveJwt = async(req,res,next)=> {
 
    try {

        if(req.cookies&&req.cookies.jwtToken){

            jwt.verify(req.cookies.jwtToken,process.env.JWT_KEY,async(err,decode)=> {
     
             if(err){
                 return res.status(401).json({sucess:false,message:'JWTvulnerable'})
             }
     
             const userId = decode.userId
            
             const user = await userCLTN.findOne({_id:userId})
     
             if (!user) {
                
                 return res.status(404).json({sucess:false, message: 'notfound' });
             }

             if(user && user.is_blocked){
                return res.status(403).json({success:false,message:'blocked'})
             }

             next()
     
         });
     
        }else if(req.cookies&&!req.cookies.jwtToken){
            
            console.log('here is the request')
            return res.status(401).json({success:false, message: 'nojwt' });    

        }
     
        
    } catch (error) {
        
        console.log(error)

    }

}