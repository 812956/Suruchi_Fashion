const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchase: {
    type: Number,
    default: 0,
    min: 0
  },
  MaximumRedeemable: {
    type: Number,
    default: null,
    min: 0
  },
  startDate: {
    type: Date,
  },
  expirationDate: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('Coupon', couponSchema);
