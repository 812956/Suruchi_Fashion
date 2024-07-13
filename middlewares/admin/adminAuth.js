
exports.isLogin = (req,res,next)=> {
   try{
      if(req.session.admin){
         console.log('this is the session',req.session)
         res.redirect('/admin/admin_panel')
      }else{
       next()
      }
   }catch(error){
      console.log(error.message)
   }
}


exports.haveAccess = (req,res,next)=>{
   try {
      if(req.session.admin){
         next()
      }else{
         res.redirect('/admin/admin_signIn')
      }
   } catch (error) {
      console.log(error.message)
   }
}