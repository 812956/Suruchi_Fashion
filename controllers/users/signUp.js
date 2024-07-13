const User = require('../../modles/users/usersModel')
const bcrypt = require('bcrypt')
const Otp = require('../../modles/users/otpModal')
const { generateRandomOtp, saveOtp } = require('../../utils/otpGenerator')
const sendOTPEmail = require('../../utils/sendMail')
const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')

// signUp page
exports.viewSignUp = async (req, res) => {
    try {
        res.status(200).render('user/partials/signUp')
    } catch (error) {
        console.log(error.message)
    }
    
}


//User registration with otp verification
exports.registerUser = async (req, res) => {
    try {

        // checking the email is existing or not
        const regexPattern = new RegExp(`^${req.body.email}$`,'i')
        const checkemail = await User.findOne({ email: regexPattern })

        if (checkemail) {
            res.status(400).json({ success: false, message: 'Email is already taken' })
        } else {

            // saving user data before verification

            const { name, email, mobile, password } = req.body
            const hashedpassword = await bcrypt.hash(password, 10)

            const newUser = new User({
                name,
                email,
                mobile,
                password: hashedpassword
            })

            const userResult = await newUser.save()

            const code = generateRandomOtp()
            // console.log(code)
            const userOtp = await saveOtp(userResult._id, code)

            // sending OTP to user mail
            console.log(userResult.email,userOtp.code)
            sendOTPEmail(userResult.email, userOtp.code)

            // jwt payload
            const userData = {
                userId: userOtp.userId
            }

            // creating jwt token 
            const jwtToken = jwt.sign(userData, process.env.JWT_KEY)
           
            // saving jwt in cookies
            res.cookie('jwtToken', jwtToken, {
                httpOnly: true,
                secure: false,
                sameSite: 'strict',
            })

            res.status(200).json({ success: true, message: 'please click ok button to generate otp' })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' })
    }
}


// otpPage rendering
exports.otpPage = asyncHandler(async (req, res) => {
    res.status(200).render('user/partials/otp')
})

// otp verification 
exports.otpVerification = asyncHandler(async(req,res)=> {
    
    const {A,B,C,D,E,F} = req.body
    const enteredcode = A+B+C+D+E+F
    
    // decoding jwt from req.cookies.jwtToken
    
    const decodedJwt = jwt.decode(req.cookies.jwtToken)
    console.log(decodedJwt)
    const savedOtp = await Otp.findOne({userId:decodedJwt.userId})
    
if(savedOtp){
    if(savedOtp.code === enteredcode && savedOtp.userId.equals(decodedJwt.userId)){
        await User.findByIdAndUpdate(
            decodedJwt.userId,
            {is_verified:true},
            {new:true} 
        )
        
        res.status(200).json({ok:true})

    }else{
        res.status(400).json({ok:false,message:'Invalid Otp'})
    }
}else{
    res.status(500).json({ok:false,message: 'Failed to Verify OTP,click resend button'}) 
}
})


// resend otp
exports.resendOtp = asyncHandler(async(req,res)=> {
   
    const jwtUserId = jwt.decode(req.cookies.jwtToken).userId
    
    const userData = await User.findById(jwtUserId)
    const otpCode = generateRandomOtp()

    const {code} = await saveOtp(jwtUserId,otpCode)
    
    sendOTPEmail(userData.email,code)

    res.status(200).json({success:true,message:'OTP resent successfully'})
     
},(err,req,res)=>{
  console.error('Error resending Otp',err)
  res.status(500).json({success:false,message: 'Failed to resend OTP'})
})