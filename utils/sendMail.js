// const nodeMailer = require('nodemailer')

// // creating smtp mail transpoter

// const transpoter = nodeMailer.createTransport({
//     host: 'smtp.gmail.com',
//     port: 587,
//     secure: false,
//     auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASSWORD 
//     }

// })

// // sending otp to the user using smtp mail server

// async function sendOTPEmail(userEmail,otpCode){
//     try {

//      // Email Content
//     const mailOptions = {
//     from: process.env.SMTP_USER,
//     to: userEmail,
//     subject: 'Your OTP for Verification',
//     text: `Your OTP for verification is: ${otpCode}`
//     }; 

//     const info = await transpoter.sendMail(mailOptions)
//     console.log('Email sent:', info.messageId);
    
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Failed to send OTP email.');
//     }
// }


// module.exports = sendOTPEmail

const nodeMailer = require('nodemailer');

// Creating SMTP mail transporter
const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use TLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false
    }
});

// Sending OTP to the user using SMTP mail server
async function sendOTPEmail(userEmail, otpCode) {
    try {
        // Email content
        const mailOptions = {
            from: `"Your Service Name" <${process.env.SMTP_USER}>`, // Better from field
            to: userEmail,
            subject: 'Your OTP for Verification',
            text: `Your OTP for verification is: ${otpCode}\n\nIf you did not request this, please ignore this email.`, // Improved content
            html: `<p>Your OTP for verification is: <strong>${otpCode}</strong></p><p>If you did not request this, please ignore this email.</p>` // HTML content
        };

        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send OTP email.');
    }
}

module.exports = sendOTPEmail;
