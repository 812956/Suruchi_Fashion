const asyncHandler = require('express-async-handler');
const userCLTN = require('../../modles/users/usersModel')
const ordersCLTN = require('../../modles/users/order') 
const productCLTN = require('../../modles/admin/productModal')



exports.view = asyncHandler(async (req, res) => {
    // Fetch total users
    const totalUsers = await userCLTN.countDocuments({});

    // Fetch total orders
    const totalOrders = await ordersCLTN.countDocuments({});

    // Calculate total revenue from delivered products
    const orders = await ordersCLTN.find({});
    let totalRevenue = 0;
    orders.forEach(order => {
        console.log(order.deliveryCharge)
        totalRevenue += order.deliveryCharge
        order.products.forEach(product => {
            if (product.orderstatus === "Delivered") {
                    console.log(product.subtotal)
                totalRevenue += product.subtotal;
            }
        });
    });

    // Fetch total products
    const totalProducts = await productCLTN.countDocuments({});

    res.status(200).render('admin/partials/dashboard', {
        totalUsers,
        users:totalUsers,
        totalOrders,
        totalRevenue,
        totalProducts
    });
});


exports.getChartData = asyncHandler(async (req, res) => {
    const { filter } = req.query;

    console.log(filter)

    let startDate, endDate;
    const now = new Date();
    if (filter === 'yearly') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
    } else if (filter === 'monthly') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (filter === 'weekly') {
        startDate = new Date(now.setDate(now.getDate() - now.getDay()));
        endDate = new Date(now.setDate(now.getDate() + 6));
    } else {
        startDate = new Date(0);
        endDate = new Date();
    }

    try {
        const orders = await ordersCLTN.find({
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        });

        const bestSellingProducts = await ordersCLTN.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$products' },
            { $group: { _id: '$products.productName', totalSold: { $sum: '$products.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

  
   
    const bestSellingCategories = await ordersCLTN.aggregate([
        { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
        { $unwind: '$products' },
        { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'productDetails' } },
        { $unwind: '$productDetails' },
        { $group: { _id: '$productDetails.categoryId', totalSold: { $sum: '$products.quantity' } } },
        { $sort: { totalSold: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryDetails' } },
        { $unwind: '$categoryDetails' },
        { $project: { _id: 0, categoryId: '$_id', categoryName: '$categoryDetails.name', totalSold: 1 } }
    ]);


        const bestSellingBrands = await ordersCLTN.aggregate([
            { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
            { $unwind: '$products' },
            { $lookup: { from: 'products', localField: 'products.productId', foreignField: '_id', as: 'productDetails' } },
            { $unwind: '$productDetails' },
            { $group: { _id: '$productDetails.brand', totalSold: { $sum: '$products.quantity' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 }
        ]);

        console.log( bestSellingProducts,bestSellingCategories, bestSellingBrands)

        res.json({
            bestSellingProducts,
            bestSellingCategories,
            bestSellingBrands
        });
    } catch (error) {
        res.status(500).send(error.message);
    }
});


