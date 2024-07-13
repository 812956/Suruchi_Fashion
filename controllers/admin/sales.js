const {OK,UNAUTHORIZED,CONFLICT} = require('../../utils/statuscodes')
const asyncHandler = require('express-async-handler')
const productVariantCLTN = require('../../modles/admin/productsVariantsMd');
const Coupon = require('../../modles/admin/coupon')
const userCLTN = require('../../modles/users/usersModel')
const Order = require('../../modles/users/order')
const WalletCLTN = require('../../modles/users/wallet')
const jwt = require('jsonwebtoken')
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { table } = require('pdfkit-table');



exports.view = asyncHandler(async (req, res) => {
  let orders = await Order.find().populate('customer');

  if (req.query.startDate && req.query.endDate) {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).populate('customer');
  } else if (req.query.range === 'day') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);
    orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('customer');
  } else if (req.query.range === 'week') {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('customer');
  } else if (req.query.range === 'month') {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('customer');
  }

  const filteredOrders = [];
  let overallSalesCount = 0;
  let overallOrderAmount = 0;
  let overallDiscount = 0;

  for (const order of orders) {
    const deliveredProducts = order.products.filter(product => product.orderstatus === 'Delivered');
    console.log(deliveredProducts)

    overallOrderAmount+=order.deliveryCharge

    for (const product of deliveredProducts) {
      
      const productVariant = await productVariantCLTN.findById(product.variantId);
      const offerDiscount = productVariant.offerDiscount ? productVariant.offerDiscount : 0;
      const offerAmount = (productVariant.prices[0]* offerDiscount) / 100;

      overallSalesCount += product.quantity;
      overallOrderAmount += product.subtotal ;
      overallDiscount += offerAmount * product.quantity;

      filteredOrders.push({
        orderId: order._id,
        orderDate: new Date(order.createdAt).toLocaleDateString(), // Format date as required
        productName: product.productName,
        customer: order.shippingAddress.fullName,
        paymentMode: order.modeOfPayment,
        status: product.orderstatus,
        offerDiscount: `₹${offerAmount} (${offerDiscount}%)`,
        couponDiscount: order.coupon ? `₹${order.coupon.claimedAmount}` : '₹0',
        productSubtotal: `₹${product.subtotal}`
      });
    }
  }

  res.status(200).render('./admin/partials/sales/salesReport', {
    orders: filteredOrders,
    overallSalesCount,
    overallOrderAmount,
    overallDiscount
  });
});


// Function to handle Excel download
exports.downloadExcel = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('customer');
  
    // Create a new Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');
  
    // Define headers
    worksheet.columns = [
      { header: 'Order ID', key: 'orderId', width: 15 },
      { header: 'Order Date', key: 'orderDate', width: 20 },
      { header: 'Product Name', key: 'productName', width: 30 },
      { header: 'Customer', key: 'customer', width: 30 },
      { header: 'Payment Mode', key: 'paymentMode', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Offer Discount', key: 'offerDiscount', width: 15 },
      { header: 'Coupon Discount', key: 'couponDiscount', width: 15 },
      { header: 'Final Cart Price', key: 'finalCartPrice', width: 20 }
    ];
  
    // Add data rows
    orders.forEach(order => {
      order.products.forEach(product => {
        if (product.orderstatus === 'Delivered') {
          worksheet.addRow({
            orderId: order._id.toString(),
            orderDate: new Date(order.createdAt).toLocaleDateString(),
            productName: product.productName,
            customer: order.shippingAddress.fullName,
            paymentMode: order.modeOfPayment,
            status: product.orderstatus,
            offerDiscount: order.coupon ? `${order.coupon.percentage}%` : '',
            couponDiscount: order.coupon ? `₹${order.coupon.claimedAmount}` : '',
            finalCartPrice: `₹${order.grandTotal}`
          });
        }
      });
    });
  
    // Set response headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.xlsx"');
  
    // Write workbook to response
    await workbook.xlsx.write(res);
    res.end();
  });

  
// Function to handle PDF download

exports.downloadPdf = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('customer');

  // Create a new PDF document
  const doc = new PDFDocument({ bufferPages: true, size: 'A4', margin: 30 });

  // Set response headers for PDF file download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.pdf"');

  // Define table headers
  const tableHeaders = [
    'Order Date', 'Product Name', 'Offer', 'Coupon', 'Total'
  ];

  // Define column widths
  const colWidths = [80, 250, 100, 50, 50];

  // Draw table header
  doc.fontSize(17).text('SURUCHI', { align: 'center' });
  doc.fontSize(12).text('Orders Report', { align: 'center' });
  doc.moveDown(2);

  // Draw table headers
  let x = doc.x, y = doc.y;
  tableHeaders.forEach((header, i) => {
    doc.text(header, x, y, { width: colWidths[i], align: 'center' });
    x += colWidths[i];
  });

  // Draw header border
  doc.rect(30, y, colWidths.reduce((a, b) => a + b, 0), 20).stroke();
  y += 20;

  // Add data rows
  for (const order of orders) {
    for (const product of order.products) {
      if (product.orderstatus === 'Delivered') {
        const productVariant = await productVariantCLTN.findById(product.variantId);
        const offerDiscount = productVariant.offerDiscount ? productVariant.offerDiscount : 0;
        const offerAmount = (productVariant.prices[0] * offerDiscount) / 100;

        const dataRow = [
          new Date(order.createdAt).toLocaleDateString(),
          product.productName,
          offerAmount ? `₹${offerAmount.toFixed(2)} (${offerDiscount}%)` : '',
          order.coupon ? `₹${order.coupon.claimedAmount}` : '₹0',
          `₹${product.subtotal}`
        ];

        // Determine the max height for the row
        let maxHeight = Math.max(...dataRow.map(cell => {
          const textHeight = doc.heightOfString(cell, { width: colWidths[dataRow.indexOf(cell)] });
          return textHeight;
        }));

        // Draw data row and borders
        x = 30;
        dataRow.forEach((cell, i) => {
          const textHeight = doc.heightOfString(cell, { width: colWidths[i] });
          const verticalOffset = (maxHeight - textHeight) / 2;
          doc.text(cell, x, y + verticalOffset, { width: colWidths[i], align: 'center' });
          doc.rect(x, y, colWidths[i], maxHeight).stroke(); // Draw cell border
          x += colWidths[i];
        });

        y += maxHeight;
        doc.moveDown(0.5);
      }
    }
  }

  // Finalize PDF document
  doc.pipe(res);
  doc.end();
});






