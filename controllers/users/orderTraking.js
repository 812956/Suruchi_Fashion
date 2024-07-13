const {OK,UNAUTHORIZED,CONFLICT} = require('../../utils/statuscodes')
const asyncHandler = require('express-async-handler')
const productVariantCLTN = require('../../modles/admin/productsVariantsMd');
const Coupon = require('../../modles/admin/coupon')
const userCLTN = require('../../modles/users/usersModel')
const orderCLTN = require('../../modles/users/order')
const WalletCLTN = require('../../modles/users/wallet')
const mongoose = require('mongoose');
const Razorpay = require('razorpay')
const jwt = require('jsonwebtoken')
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');



// Instantiate the Razorpay Instance
var instance = new Razorpay({
    key_id: process.env.RAZ_KEYID,
    key_secret: process.env.RAZ_KEYSECRET,
});


exports.invoiceDownload = asyncHandler(async (req, res) => {
    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    const orderId = req.query.orderId;
    const orderProductId = req.query.productOrderId

    const order = await orderCLTN.findOne({ _id: orderId, customer: userId }).populate('products.variantId');

    if (!order) {
        return res.status(404).send('Order not found');
    }

    const doc = new PDFDocument({ bufferPages: true, size: 'A4', margin: 30 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

    doc.fontSize(16).text('SURUCHI', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12);


    // doc.text(`Order ID: ${order._id}`);

    doc.text('SURUCHI PRIVATE LIMITED,');
    doc.text('5th Floor, Kakncheri, Malappuram, Kerala, 673634');
    doc.text('GSTIN: 06AADCG1316B2ZY');
    doc.moveDown();

    doc.text(`Ship To:`);
    doc.moveDown();
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`);
    doc.text(`Customer: ${order.shippingAddress.fullName}`);
    doc.text(`Shipping Address: ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.pinCode}`);
    doc.text(`Payment Mode: ${order.modeOfPayment}`);
    doc.moveDown();

    // Define table headers
    const tableHeaders = ['Product Name', 'Size', 'Color', 'Quantity', 'Price (₹)', 'Total (₹)'];
    const colWidths = [200, 50, 50, 50, 80, 80];
    const startX = doc.x;
    let y = doc.y;

    // Draw table header with borders
    doc.lineWidth(0.5).rect(startX, y, colWidths.reduce((a, b) => a + b), 20).stroke();
    y += 5;
    tableHeaders.forEach((header, i) => {
        doc.text(header, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
            width: colWidths[i],
            align: 'center'
        });
    });
    y += 15;

    // Draw product rows
    order.products.forEach(product => {

        if(product._id == orderProductId){
        const dataRow = [
            product.productName,
            product.variantSize,
            product.variantColor,
            product.quantity,
            `₹${product.variantPrice.toFixed(2)}`,
            `₹${(product.variantPrice * product.quantity).toFixed(2)}`
        ];
     

        // Draw row border
        doc.lineWidth(0.5).rect(startX, y, colWidths.reduce((a, b) => a + b), 20).stroke();
        y += 5;
        
        // Draw data row
        dataRow.forEach((cell, i) => {
            doc.text(cell, startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0), y, {
                width: colWidths[i],
                align: 'center'
            });
        });
        y += 15;

    }
    });

    // Positioning of totals right below the table
    y += 10;  // Adjusting the y-coordinate to be closer to the table

    // Add total amounts
    const totals = [
        { label: 'Subtotal:', amount: `₹${order.subTotal.toFixed(2)}` },
        { label: 'Delivery Charge:', amount: `₹${order.deliveryCharge.toFixed(2)}` },
    ];

    if (order.coupon) {
        totals.push({ label: 'Coupon Discount:', amount: `-₹${order.coupon.claimedAmount.toFixed(2)}` });
    }

    totals.push({ label: 'Grand Total:', amount: `₹${order.grandTotal.toFixed(2)}` });

    totals.forEach(total => {
        doc.text(total.label, startX + 300, y, { width: 100, align: 'right' });
        doc.text(total.amount, startX + 400, y, { width: 80, align: 'right' });
        y += 15;
    });

    doc.end();
    doc.pipe(res);
});



exports.view = asyncHandler(async(req,res)=> {

    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    const orderId = req.query.orderId

    const orderDetails = await orderCLTN.findOne({_id:orderId,customer:userId}).populate('products.variantId')

       // Calculate the estimated delivery date
       const calculateEstimatedDeliveryDate = (createdAt) => {
        const estimatedDate = new Date(createdAt);
        estimatedDate.setDate(estimatedDate.getDate() + 7);
        return estimatedDate;
    };

    orderDetails.estimatedDeliveryDate = calculateEstimatedDeliveryDate(orderDetails?.createdAt);
    // console.log(orderDetails)

    res.render('./user/profile/partials/orderTracking',{orderDetails})
})



// cancelling the order

exports.cancelProduct = asyncHandler(async (req,res)=> {

    const { orderId, productId, status, variantSize, quantity } = req.body;

   

    //  Fetch the order details
        const order = await orderCLTN.findById(orderId);
        const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
        let orders;

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
      
        // Find the product in the order
        const product = order.products.id(productId);
       
        if (!product) {
            return res.status(404).json({ message: "Product not found in order" });
        }

        if(product.orderstatus==='Delivered'){
           
            return res.status(OK).json({ success:false,message: "You order has been delivered" });  
        }

    
        if(order.modeOfPayment=='COD'){

          
             
            if(order.coupon.percentage && order.coupon.percentage!==0){

                console.log('enterd into  coupon discount')

                for(let product of order.products){
                     if(product.orderstatus==='Delivered'){ 
                        product.orderstatus = 'RequestedReturn'
                        product.paymentStatus = 'pending'
                        product.requestedDate = new Date()

                    }
                }

                product.paymentStatus = 'Done'
                product.orderstatus = 'Cancelled'
                product.cancelledDate = new Date();

                // 
                const discount = order.coupon.percentage
                const min_pur_amou = order.coupon.minPurchase
                const maxRadeemAmou = order.coupon.maxPurchase


                let sum =0
                let count = 0

                for(let item of order.products){
                    if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){
                           sum+= item.variantPrice * item.quantity
                           count ++
                    }
                }

                console.log('hello world',sum)

                if(sum >= min_pur_amou){

                 let discountAmount = sum * (discount / 100)

                 if( discountAmount>maxRadeemAmou){
                     discountAmount = maxRadeemAmou
                 }
                  
                 discountAmount = Math.round(discountAmount)

                 const discountForSingleItem = discountAmount / count

                 let lastsum = 0;

                 for(let item of order.products){
                    if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){

                        item.subtotal = (item.variantPrice * item.quantity) - discountForSingleItem

                      lastsum += item.subtotal

                    }
                 }
                

                 // changing total amount 

                 let subTotal = 0
                 let total = 0

                 for(let item of order.products){
                    if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){
                    subTotal += item.variantPrice * item.quantity
                    total += item.subtotal
                   
                    }
                 }

                 console.log(subTotal,total)

                 total += subTotal >=5000 ? 0:50
                
                 
                 order.subTotal = subTotal
                 order.grandTotal = total
                

                }
                else{

                   
                  
                    let subTotal =0;
                    let grandTotal = 0;

                    for(let item of order.products){

                         if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){
                            
                            item.subtotal = item.variantPrice * item.quantity
                            subTotal+= item.subtotal
                         }
                             
                    }
                    grandTotal = subTotal
                    grandTotal += subTotal >=5000 ? 0:50

                    order.subTotal = subTotal
                    order.grandTotal = grandTotal
                   
                }
         
                    // Update stock for the product variant
                    const productVariant = await productVariantCLTN.findById(product.variantId);
                    if (!productVariant) {
                        return res.status(404).json({ message: "Product Variant not found" });
                    }

                    // Find the index of the size
                    const sizeIndex = productVariant.sizes.indexOf(variantSize);
                    if (sizeIndex === -1) {
                        return res.status(400).json({ message: "Invalid variant size" });
                    }

                    
                    // Increase stock
                    productVariant.stocks[sizeIndex] += product.quantity
                    await productVariant.save();


            }
            else{

             

                product.paymentStatus = 'Done'
                product.orderstatus = 'Cancelled'
                product.cancelledDate = new Date();

                
                let subTotal = 0
                let total = 0

                for(let item of order.products){
                   if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){
                   subTotal += item.variantPrice * item.quantity
                   total += item.subtotal
                  
                   }
                }

                console.log(subTotal,total)

                total += subTotal >=5000 ? 0:50
               
                
                order.subTotal = subTotal
                order.grandTotal = total
               



                 // Update stock for the product variant
                 const productVariant = await productVariantCLTN.findById(product.variantId);
                 if (!productVariant) {
                     return res.status(404).json({ message: "Product Variant not found" });
                 }

                 
                 // Find the index of the size
                 const sizeIndex = productVariant.sizes.indexOf(variantSize);
                 if (sizeIndex === -1) {
                     return res.status(400).json({ message: "Invalid variant size" });
                 }

                 
                 // Increase stock
                 productVariant.stocks[sizeIndex] += product.quantity
                 await productVariant.save();

            }

            let sts = true

            order.products.forEach(item => {
                if(item.paymentStatus !== 'paid' && item.paymentStatus !=='Done' && item.paymentStatus !=='Refunded'){
                    sts = false
                }
            })

            if (sts === true) {
                order.orderStatus = 'Completed'
                order.paymentStatus = 'Done'
            }


            orders = await order.save();

            // return res.status(200).json({ productOrderStatus: 'cancelled' });


        } else {

             if(order.coupon.percentage && order.coupon.percentage !==0 && order.modeOfPayment !=='COD' ){

                 for(let item of order.products){
                    if(item.orderstatus !=='Delivered'){

                        item.orderstatus = 'Cancelled'
                        item.paymentStatus = 'Refunded'
                       

                        
                        const variant = await productVariantCLTN.findOne({_id:item.variantId})
                        const stockIndex = variant.sizes.indexOf(item.variantSize)
                        variant.stocks[stockIndex]+=item.quantity
                        await variant.save()

                        
                    }
                    else{

                        item.orderstatus = 'RequestedReturn'
                        item.paymentStatus = 'pending'

                    }
                }

            } else {

                product.orderstatus = 'Cancelled'
                product.paymentStatus = 'Refunded'

                // updating variant size 
                const variant  = await productVariantCLTN.findOne({_id:product.variantId})
                const stockIndex = await variant.sizes.indexOf(product.variantSize)
                variant.stocks[stockIndex]+= product.quantity
                await variant.save()

                let subTotal = 0
                let total = 0

                for(let item of order.products){
                   if(item.orderstatus === 'pending' || item.orderstatus === 'Shipped'){
                   subTotal += item.variantPrice * item.quantity
                   total += item.subtotal
                  
                   }
                }

                console.log(subTotal,total)

                total += subTotal >=5000 ? 0:50
               
                
                order.subTotal = subTotal
                order.grandTotal = total
               

            }

            
            let sts = true

            order.products.forEach(item => {
                if(item.paymentStatus !== 'Refunded' && item.orderStatus !=='Delivered' ){
                    sts = false
                }
            })

            if (sts === true) {
                order.orderStatus = 'Completed'
                order.paymentStatus = 'Done'

            }

            orders = await order.save();

            console.log('this is the updated order',orders)

        }



        let totalamount = 0
        
        if(order.modeOfPayment !== 'COD'){

            if(orders.coupon.percentage && orders.coupon.percentage!==0){
               let sum = 0

               for(const item of orders.products){
                 
                if(item.orderstatus !== 'Delivered' && item.orderstatus !== 'RequestedReturn'){
                    sum += item.subtotal
                }

               }

               totalamount = sum

               console.log('this si subtotal',sum)

            } else {

                let item 

                orders.products.forEach((items,index)=> {
                  
                    if(items._id == productId){
                       
                        item = items
                      
                        return true
                    }
                })
               
                
                totalamount = item.subtotal
                
                
            }

        }

        console.log('this total amount is for if coupon ',totalamount )


        // Update user's wallet balance
        await WalletCLTN.findOneAndUpdate(
            { userID: order.customer },
            {
                $push: {
                    transactions: {
                        amount: totalamount,
                        transactionMethod: 'Refund',
                        date: new Date()
                    }
                },
                $inc: { balance: totalamount }
            },
            { upsert: true }
        );



    return res.status(200).json({ productOrderStatus: 'cancelled' });   
                            

})



// returning the product

exports.returnProdcut = asyncHandler(async(req,res)=>{
    
  const {orderId,productId,quantity, variantSize,returnReason,reasonDetails} = req.body  
  console.log(orderId,productId,quantity,variantSize) 
  const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
  
  const reasonPattern = /^[a-zA-Z,'"\-\(\)\s]*$/

   // reason Validation
   if (!reasonPattern.test(reasonDetails.trim())) {
    return res.status(401).json({ msg: 'Invalid Reason', type: 'error' });
   }

   
   const order = await orderCLTN.findOne({_id:orderId,customer:userId})
   const returnedItem = order.products.id(productId)

   returnedItem.orderstatus = 'RequestedReturn'
   returnedItem.paymentStatus = 'pending'
   returnedItem.reasonForReturn = returnReason
   order.orderStatus = 'pending'
   order.paymentStatus = 'Done'

   await order.save()

   res.status(OK).json({success:true,message:'You have requested to return'})

})



// repay for faild products

exports.rePay = asyncHandler(async(req,res)=> {
    
    const { addressId, paymentMethod, coupon,orderId } = req.body;
    // orderId =  new mongoose.Types.ObjectId(orderId)
    
    const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;
    // const address = await addressCLTN.findOne({_id:addressId});
   
     
    const oldorder = await orderCLTN.findOne({ _id:orderId,customer:userId }).populate({
        path: 'products.productId',
        // select: '_id name is_deleted'
    })

    console.log(oldorder)


    let total = oldorder.grandTotal
    let paymentId = undefined
  
        var options = {
            amount: Math.round(total * 100), // Amount in paise
            currency: "INR",
            receipt: `receipt_order_${new Date().getTime()}`,
            payment_capture: 1, // Auto capture
          };

      
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

        // oldorder.paymentStatus = 'paid'
        // oldorder.products.forEach((product)=>{
        //     product.paymentStatus = 'paid'
        // }) 

       await oldorder.save()
    
    res.status(OK).json({success:true,savedorderId:oldorder._id,orderId:paymentId,total:total*100})
})