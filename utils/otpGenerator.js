const Otp = require('../modles/users/otpModal')

// // Function to generate randon otp

// const generateRandomOtp = function () {
//     const length = 6; 
//     let otp = '';
//     for (let i = 0; i < length; i++) {
//         otp += Math.floor(Math.random() * 10); 
//     }
//     return otp;
// }


// // saving otp 
// const saveOtp = async (userId,code)=> {
//     try {
         
//         const expiresAt = new Date(Date.now() + (60 * 1000));
//         const newOtp = new Otp({
//             userId,
//             code,
//             expireAt: expiresAt
//         })

//         return otpResult =await newOtp.save()
          
//     } catch (error) {
//        console.log(error.message) 
//     }
// }

// module.exports = {
//     generateRandomOtp,
//     saveOtp
// }

const generateRandomOtp = function () {
    const length = 6; 
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += Math.floor(Math.random() * 10); 
    }
    return otp;
}

const saveOtp = async (userId, code) => {
    try {
        // Set expiration time to one minute from now
        const expiresAt = new Date(Date.now() + (60 * 1000)); // 60 seconds
        const newOtp = new Otp({
            userId,
            code,
            expireAt: expiresAt
        });

        return await newOtp.save();
    } catch (error) {
        console.log(error.message);
        throw new Error('Failed to save OTP.');
    }
}

module.exports = {
    generateRandomOtp,
    saveOtp
};
