// const mongoose = require('mongoose');

// const otpSchema = new mongoose.Schema({
//     userId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//     },
//     code: {
//         type: String,
//         required: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now()
//     },
//     expireAt: {
//         type: Date,
//         required: true
//     }
  
// });

// // Set up a TTL index on expiresAt
// // otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 50 });
// otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 60 });

// module.exports = mongoose.model('Otp', otpSchema);


const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    code: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        required: true
    }
});

// Set up a TTL index to expire documents after 60 seconds
otpSchema.index({ expireAt: 1 }, { expireAfterSeconds: 60 });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;

