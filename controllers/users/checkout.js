
const asyncHandler = require('express-async-handler');
const { OK } = require('../../utils/statuscodes');
const addressCLTN = require('../../modles/users/addressModel');
const productCLTN = require('../../modles/admin/productModal')
const cartCLTN = require('../../modles/users/cart'); 
const productVariantCLTN = require('../../modles/admin/productsVariantsMd');
const orderCLTN = require('../../modles/users/order')
const jwt = require('jsonwebtoken');
const Razorpay = require('razorpay')
const crypto = require('crypto');
const coupon = require('../../modles/admin/coupon')

exports.view = asyncHandler(async (req, res) => {

    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    const addresses = await addressCLTN.find({ userId });
    const cart = await cartCLTN.findOne({ userId }).populate({
        path: 'products.productId',
        select: '_id name is_deleted'
    }).populate({
        path: 'products.variantId',
        // select: '_id sizes stocks is_delete',
    });

    if(!cart || !cart.products){
        return res.status(OK).redirect('/cart')
    }else if(cart && cart.products.length==0){
        return res.status(OK).redirect('/cart')
    }

    const coupons = await coupon.find({})

    let  subtotal=0
    let shippingFee = 0
    let total = 0

    if (!cart || !cart.products) {
        return res.status(OK).render('./user/profile/partials/checkout', { addresses, cart,subtotal,shippingFee,total,coupons});
    }

    let validProducts = [];
    let totalOfferAmount = 0

    if (cart) {
        cart.products.forEach(item => {
            const { productId, variantId, variantSize, quantity } = item;

            
            const product = item.productId;
            if (!product || product.is_deleted) {
                return; 
            }
  
            const variant = item.variantId;
            if (!variant || variant.is_delete) {
                return;  
            }

            const stockIndex = variant.sizes.indexOf(variantSize);
            // if (stockIndex === -1 || variant.stocks[stockIndex] < quantity) {
            //     item.quantity = variant.stocks[stockIndex]
            //     // return; 
            // }
            if(variant.stocks[stockIndex] ==0){
                return 
            }else if(variant.stocks[stockIndex] <= quantity){
                item.quantity = variant.stocks[stockIndex]
            }
            else {
                item.quantity = quantity
            }

            if(variant.offerDiscount){
                
                
                // item.variantPrice = Math.round( item.variantPrice - (item.variantPrice*(variant.offerDiscount /100)))

            }


            validProducts.push(item);
        });

        cart.products = validProducts;

    
    }

    //  subtotal
    subtotal = cart.products.reduce((acc, product) => {
        return acc + (product.variantPrice * product.quantity);
    }, 0);

    //  shipping fee
     shippingFee = subtotal > 5000 ? 'Free' : 50;

    //  total
     total = subtotal + (shippingFee === 'Free' ? 0 : 50);
  
    

    res.status(OK).render('./user/profile/partials/checkout', { addresses, cart, subtotal, shippingFee, total , coupons});
});


// Instantiate the Razorpay Instance
var instance = new Razorpay({
    key_id: process.env.RAZ_KEYID,
    key_secret: process.env.RAZ_KEYSECRET,
});


// save to order
exports.saveOrder = asyncHandler(async(req,res)=> {

    
  
    const { addressId, paymentMethod, coupon } = req.body;
   
    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    const address = await addressCLTN.findOne({_id:addressId});
   
     
    const cart = await cartCLTN.findOne({ userId }).populate({
        path: 'products.productId',
        select: '_id name is_deleted'
    }).populate({
        path: 'products.variantId',
        // select: '_id sizes stocks is_delete',
    });
   
    if (!cart || !cart.products) {
     return res.status(400).json({success:false,message:'there is not products in your cart'}) 
    }


    let validProducts = [];

    if (cart) {
        cart.products.forEach(item => {
            const { productId, variantId, variantSize, quantity } = item;

            
            const product = item.productId;
            if (!product || product.is_deleted) {
                return; 
            }
  
            const variant = item.variantId;
            if (!variant || variant.is_delete) {
                return;  
            }

            const stockIndex = variant.sizes.indexOf(variantSize);
            // if (stockIndex === -1 || variant.stocks[stockIndex] < quantity) {
            //     // return; 
            //     item.quantity = variant.stocks[stockIndex]
            // }
            if(variant.stocks[stockIndex] ==0){
                return 
            }else if(variant.stocks[stockIndex] <= quantity){
                item.quantity = variant.stocks[stockIndex]
            }
            else {
                item.quantity = quantity
            }

            
            // if(variant.offerDiscount){
                
            //     item.variantPrice = Math.round( item.variantPrice - (item.variantPrice*(variant.offerDiscount /100)))

            // }

            
            validProducts.push(item);
            console.log( validProducts)
        });

        cart.products = validProducts;

    }


    const subtotal = cart.products.reduce((acc, product) => acc + (product.variantPrice * product.quantity), 0);
    const shippingFee = subtotal > 5000 ? 'Free' : 50;
    const couponDiscount = coupon ? (coupon.discount / 100) * (subtotal + (shippingFee === 'Free' ? 0 : 50)) : 0;
    const claimedAmount = coupon ? Math.min(couponDiscount, coupon.minPurchase, coupon.maxRedeemable) : 0;
    const total = subtotal + (shippingFee === 'Free' ? 0 : 50) - claimedAmount;

    // Add subtotal and coupon share to each product
    const couponSharePerProduct = claimedAmount / cart.products.length;

    
    let valproducts = []

    cart.products.forEach(item => {
       
        item.subtotal = (item.variantPrice * item.quantity) - couponSharePerProduct;
        console.log(item.subtotal)
        valproducts.push(item)
    });

    console.log(valproducts)


    let paymentId = null

    if(paymentMethod =='onlinepay'){
        
        var options = {
            amount: Math.round(total * 100), // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            payment_capture: 1, // Auto capture
          };

        console.log('Subtotal:', subtotal);
        console.log('Shipping Fee:', shippingFee);
        console.log('Coupon Discount:', couponDiscount);
        console.log('Claimed Amount:', claimedAmount);
        console.log('Total:', total);


          try {
            
            // Await the creation of the order and capture the order ID
            const razorpayOrder = await  instance.orders.create(options);
            paymentId = razorpayOrder.id;
            console.log('Razorpay Order Created:', razorpayOrder);
            console.log('Payment ID:', paymentId);
        } catch (err) {
            console.error('Error creating Razorpay order:', err);
            return res.status(500).json({ success: false, message: 'Error creating Razorpay order' });
        }
          
    }


   // duplicate checking
    const existingOrder = await orderCLTN.findOne({
       customer: userId,
        products: cart.products,
        shippingAddress: address,
        modeOfPayment: paymentMethod, 
        subTotal: subtotal,
        grandTotal: total,
        deliveryCharge: shippingFee === 'Free' ? 0 : 50
    });

    if (existingOrder) {
        return res.status(ERROR).json({ success: false, message: "Order already exists" });
    }

    const order = new orderCLTN({
        customer: userId,
        products: cart.products,
        shippingAddress: address,
        modeOfPayment: paymentMethod, 
        subTotal: subtotal,
        grandTotal: total,
        deliveryCharge: shippingFee === 'Free' ? 0 : 50,
        coupon: coupon ? {
            couponId: coupon.couponId,
            percentage: coupon.discount,
            minPurchase: coupon.minPurchase,
            maxPurchase: coupon.maxRedeemable==null?0:coupon.maxRedeemable,
            claimedAmount: claimedAmount
        } : undefined
       
    });

    const savedorder = await order.save()

    await cartCLTN.deleteOne({userId:userId}) 
    // minesing the count of the varinat stocks
    for(let item of savedorder.products){
       
        const variant = await productVariantCLTN.findOne({_id:item.variantId})
        const stockIndex = variant.sizes.indexOf(item.variantSize)
       
        variant.stocks[stockIndex] = Math.max(0, variant.stocks[stockIndex] - item.quantity);
        await variant.save(); 

    }
    
    res.status(OK).json({success:true,savedorderId:savedorder._id,orderId:paymentId,total:savedorder.grandTotal*100})
})



// verifyPayment

exports.verifyPayment = asyncHandler(async (req,res)=> {

    const { paymentId, orderId, signature ,userorderId} = req.body;

    // Generate expected signature using HMAC SHA256
    const expectedSignature = crypto
        .createHmac('sha256',process.env.RAZ_KEYSECRET)
        .update(orderId + "|" + paymentId)
        .digest('hex');

    // Compare signatures
    if (expectedSignature === signature) {
        // Payment is verified
        const orderpaymentStatus = await orderCLTN.findByIdAndUpdate(userorderId,
            {$set:{paymentStatus:'paid'}},
            {new:true}
        )

        // Update paymentStatus of each product in the order
        await orderCLTN.updateMany(
            { _id: userorderId, 'products.paymentStatus': 'pending' },
            { $set: { 'products.$[].paymentStatus': 'paid' } }
        );

        res.json({ success: true, message: 'Payment verified successfully!' });
    } else {
        // Invalid signature, possible tampering
        res.status(400).json({ success: false, message: 'Invalid payment signature!' });
    }

})





