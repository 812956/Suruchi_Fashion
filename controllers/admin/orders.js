const { OK, UNAUTHORIZED, CONFLICT } = require("../../utils/statuscodes");
const asyncHandler = require("express-async-handler");
const productVariantCLTN = require("../../modles/admin/productsVariantsMd");
const Coupon = require("../../modles/admin/coupon");
const userCLTN = require("../../modles/users/usersModel");
const orderCLTN = require("../../modles/users/order");
const WalletCLTN = require("../../modles/users/wallet");
const jwt = require("jsonwebtoken");

exports.view = asyncHandler(async (req, res) => {
    const orders = await orderCLTN.find({}).populate({
        path: "customer",
        select: "name email mobile",
    });

    // console.log(orders)

    res.status(OK).render("./admin/partials/orders/ordersListing", { orders });
});

// viewOrderDetails
exports.viewOrderDetails = asyncHandler(async (req, res) => {
    const orderId = req.query.id;

    const order = await orderCLTN.findOne({ _id: orderId }).populate([
        {
            path: "products.variantId",
            select: "images",
        },
        {
            path: "customer",
            select: "fullName email",
        },
    ]);

    res.status(OK).render("./admin/partials/orders/orderDetails", { order });
});

// changing one order single product status

exports.changeStatus = asyncHandler(async (req, res) => {
    const { orderId, productId, newStatus, variantSize, quantity } = req.body;

    let updatedStatus = newStatus;

    // Fetch the order details
    const order = await orderCLTN.findById(orderId);
    const product = order.products.id(productId);
    const oldGrandTotal = order.grandTotal;
    console.log("old grand total", order.grandTotal);

    if (!order || !product) {
        return res.status(404).json({ message: "Order or Product not found" });
    }

    try {
        console.log("here is the product", product);

        // For other statuses
        product.orderstatus = newStatus;
        if (newStatus === "Delivered") {
            product.paymentStatus = "paid";

            let sts = true;

            order.products.forEach((item) => {
                if (
                    item.orderstatus !== "Delivered" &&
                    item.orderstatus !== "Returned" &&
                    item.orderstatus !== "Cancelled"
                ) {
                    sts = false;
                }
            });

            if (sts === true) {
                order.orderStatus = "Completed";
                order.paymentStatus = "Done";
            }
        }

        if (newStatus === "Return Rejected") {
            product.orderstatus = "Delivered";
            product.paymentStatus = "paid";
            product.cancelOrderStatus =
                "Return Request has been Rejected. If any issues contact costomer care";
            let sts = true;

            order.products.forEach((item) => {
                if (
                    item.paymentStatus !== "paid" &&
                    item.paymentStatus !== "Done" &&
                    item.paymentStatus === "Refunded"
                ) {
                    sts = false;
                }
            });

            if (sts === true) {
                order.orderStatus = "Completed";
                order.paymentStatus = "Done";
            }
        }

        if (newStatus === "Return Accepted") {
            console.log("here is the request now ");
            console.log(product);

            product.orderstatus = "Returned";
            product.paymentStatus = "Refunded";

            let totalamount = 0;
            if (order.modeOfPayment === "COD") {
                if (order.coupon.percentage && order.coupon.percentage !== 0) {
                    for (let item of order.products) {
                        if (item.orderstatus === "Delivered") {
                            item.orderstatus = "RequestedReturn";
                            item.reasonForReturn = product.reasonForReturn;
                            item.paymentStatus = "pending";
                        }
                    }

                    // recalculating the all amount

                    let discount = order.coupon.percentage;
                    let minamount = order.coupon.minPurchase;
                    let max_redeem_amount = order.coupon.maxPurchase;

                    console.log(discount, minamount, max_redeem_amount);

                    let sum = 0;
                    let count = 0;

                    for (let item of order.products) {
                        if (
                            item.orderstatus === "pending" ||
                            item.orderstatus === "shipped"
                        ) {
                            console.log(item.variantPrice, item.quantity);
                            sum += item.variantPrice * item.quantity;
                            count++;
                        }
                    }

                    console.log("this is the total", sum);

                    if (sum >= minamount) {
                        let discountAmount = Math.round(sum * (discount / 100));

                        if (discountAmount > max_redeem_amount) {
                            discountAmount = max_redeem_amount;
                        }

                        const discountForSingleItem = discountAmount / count;

                        let lastsum = 0;

                        for (let item of order.products) {
                            if (
                                item.orderstatus === "pending" ||
                                item.orderstatus === "Shipped"
                            ) {
                                item.subtotal =
                                    item.variantPrice * item.quantity - discountForSingleItem;

                                lastsum += item.subtotal;
                            }
                        }

                        // changing total amount

                        let subTotal = 0;
                        let total = 0;

                        for (let item of order.products) {
                            if (
                                item.orderstatus === "pending" ||
                                item.orderstatus === "Shipped"
                            ) {
                                subTotal += item.variantPrice * item.quantity;
                                total += item.subtotal;
                            }
                        }

                        console.log(subTotal, total);

                        total += subTotal >= 5000 ? 0 : 50;

                        order.subTotal = subTotal;
                        order.grandTotal = total;

                        

                    } else {

                        let refund = product.variantPrice * product.quantity

                        console.log('this will ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

                        let subTotal = 0;
                        let grandTotal = 0;

                        for (let item of order.products) {
                            if (
                                item.orderstatus === "pending" ||
                                item.orderstatus === "Shipped"
                            ) {
                                item.subtotal = item.variantPrice * item.quantity;
                                subTotal += item.subtotal;
                            }
                        }
                        grandTotal = subTotal;
                        grandTotal += subTotal >= 5000 ? 0 : 50;

                        console.log("fjjjjjjjjjjjjjjjjjjjjjfsffs", subTotal, grandTotal);

                        order.subTotal = subTotal;
                        order.grandTotal = grandTotal;


                         // Update user's wallet balance
                       await WalletCLTN.findOneAndUpdate(
                        { userID: order.customer },
                        {
                            $push: {
                                transactions: {
                                    amount: refund,
                                    transactionMethod: "Refund",
                                    date: new Date(),
                                },
                            },
                            $inc: { balance: refund },
                        },
                        { upsert: true }
                    );



                    }
                }else{

                    let refund = product.variantPrice * product.quantity
                       
                    console.log("not coupon with subtotalfffffffffffffff");

                    let subTotal = 0;
                    let grandTotal = 0;

                    for (let item of order.products) {
                        if (
                            item.orderstatus === "pending" ||
                            item.orderstatus === "Shipped"
                        ) {
                            item.subtotal = item.variantPrice * item.quantity;
                            subTotal += item.subtotal;
                        }
                    }
                    grandTotal = subTotal;
                    grandTotal += subTotal >= 5000 ? 0 : 50;

                    

                    order.subTotal = subTotal;
                    order.grandTotal = grandTotal;


                     // Update user's wallet balance
                     await WalletCLTN.findOneAndUpdate(
                        { userID: order.customer },
                        {
                            $push: {
                                transactions: {
                                    amount: refund,
                                    transactionMethod: "Refund",
                                    date: new Date(),
                                },
                            },
                            $inc: { balance: refund },
                        },
                        { upsert: true }
                    );
                
                }

                let sts = true;

                order.products.forEach((item) => {
                    if (
                        item.paymentStatus !== "paid" &&
                        item.paymentStatus !== "Done" &&
                        item.paymentStatus !== "Refunded"
                    ) {
                        sts = false;
                    }
                });

                if (sts === true) {
                    order.orderStatus = "Completed";
                    order.paymentStatus = "Done";
                }
            } else {
                if (
                    order.coupon.percentage &&
                    order.coupon.percentage !== 0 &&
                    order.modeOfPayment !== "COD"
                ) {
                    for (let item of order.products) {
                        if (item.orderstatus === "Delivered") {
                            item.orderstatus = "RequestedReturn";
                            item.paymentStatus = "pending";
                            item.reasonForReturn = product.reasonForReturn;

                            order.orderStatus = "pending";
                            order.paymentStatus = "Done";
                        } else {
                            if (
                                item.orderstatus === "pending" ||
                                item.orderstatus === "shipped"
                            ) {
                                item.orderstatus = "Cancelled";
                                item.paymentStatus = "Refunded";

                                // updating variant size
                                const variant = await productVariantCLTN.findOne({
                                    _id: product.variantId,
                                });
                                const stockIndex = await variant.sizes.indexOf(
                                    product.variantSize
                                );
                                variant.stocks[stockIndex] += product.quantity;
                                await variant.save();

                                // Update user's wallet balance
                                await WalletCLTN.findOneAndUpdate(
                                    { userID: order.customer },
                                    {
                                        $push: {
                                            transactions: {
                                                amount: item.subtotal,
                                                transactionMethod: "Refund",
                                                date: new Date(),
                                            },
                                        },
                                        $inc: { balance: item.subtotal },
                                    },
                                    { upsert: true }
                                );
                            }
                        }
                    }
                }

                let sts = true;
                order.products.forEach((item) => {
                    if (
                        item.paymentStatus !== "Refunded" &&
                        item.orderstatus !== "Delivered"
                    ) {
                        sts = false;
                    }
                });

                if (sts == true) {
                    order.orderStatus = "Completed";
                    order.paymentStatus = "Done";
                }
            }

            // updating variant size
            const variant = await productVariantCLTN.findOne({
                _id: product.variantId,
            });
            const stockIndex = await variant.sizes.indexOf(product.variantSize);
            variant.stocks[stockIndex] += product.quantity;
            await variant.save();

            // Find the product in the order

            // Update user's wallet balance
            // await WalletCLTN.findOneAndUpdate(
            //     { userID: order.customer },
            //     {
            //         $push: {
            //             transactions: {
            //                 amount: product.subtotal,
            //                 transactionMethod: "Refund",
            //                 date: new Date(),
            //             },
            //         },
            //         $inc: { balance: product.subtotal },
            //     },
            //     { upsert: true }
            // );
        }

        console.log(product.orderstatus, product.paymentStatus);
        const updatedOrder = await order.save();

        console.log(
            "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk : -",
            updatedOrder
        );

        res.status(200).json({ productOrderStatus: newStatus });
    } catch (error) {
        console.error("Error updating order:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to update order status",
            error: error.message,
        });
    }
});
