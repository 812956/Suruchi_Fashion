const express = require("express");
const router = express.Router();
const signIn = require("../controllers/admin/signIn");
const adminAuth = require("../middlewares/admin/adminAuth");
const dashboard = require("../controllers/admin/dashboard");
const customers = require("../controllers/admin/customers");
const categories = require("../controllers/admin/categories");
const products = require("../controllers/admin/products");
const generateStorage = require("../utils/multer");
const { errorHandler } = require("../utils/errorHandler");
const upload = require("../utils/imageUplaod");
const VaraintUpload = require("../utils/addVariantsMulter");
const orders = require("../controllers/admin/orders");
const coupon = require("../controllers/admin/cuopon");
const sales = require('../controllers/admin/sales')
const offer = require('../controllers/admin/offer')

// multer storages
const categoryUpload = generateStorage("category");
const productsUpload = generateStorage("products");

//==========================signIn=============================

//  intializing session storage in application to every request

router
  .route("/admin_signIn")
  .get(adminAuth.isLogin, signIn.viewSignIn)
  .post(signIn.adminSignIn);

//applying haveAccess middlware to every routs
// router.use(adminAuth.haveAccess);

//==========================dashboard=============================
router.route("/admin_panel").get(dashboard.view);

router.get('/dashboard-data', dashboard.getChartData);

//==========================customer Management=============================
router.route("/admin_panel/customers_management").get(customers.view);

// block and unblock user
router.patch(
  "/admin_panel/customers_management/block_customer",
  customers.blockCustomer
);

//==========================categoreis Management=============================

router.route("/admin_panel/categories").get(categories.view);

router
  .route("/admin_panel/edit_category")
  .post(categoryUpload.single("image"), categories.edit);

router.route("/admin_panel/archive_category/:id").post(categories.softDelete);

router
  .route("/admin_panel/add_category")
  .get(categories.viewaddCategory)
  .post(categoryUpload.single("image"), categories.addCategory);

router.route("/admin_panel/types").get(categories.viewTypes);

router
  .route("/admin_panel/add_type")
  .get(categories.viewaddType)
  .post(categories.addType);

router.route("/admin_panel/edit_type").post(categories.editType);

router.route("/admin_panel/archive_type/:id").patch(categories.softDeleteType);

router
  .route("/admin_panel/getcategoriesByType")
  .get(categories.getCategoriesByType);

router.route("/getDescription/:categoryId").get(categories.getDescription);

//==========================Products Management=============================

router.route("/admin_panel/products_management").get(products.view);

router
  .route("/admin_panel/products_management/product_details")
  .get(products.veiwProductDetails);

router
  .route("/admin_panel/products_management/add_product")
  .get(products.viewaddProduct)
  .post(upload.any(), products.addProduct);

router
  .route("/admin_panel/product_management/edit_product")
  .get(products.viewEditPage)
  .post(
    upload.fields([
      { name: "thumbnail1", maxCount: 1 },
      { name: "thumbnail2", maxCount: 1 },
    ]),
    products.editProduct
  );

router
  .route("/admin_panel/products_management/changeDelete")
  .patch(products.cahngeDelete);

//==========================variants Management=============================

router
  .route("/admin_panel/products_management/add_variant")
  .get(products.viewaddVariant)
  .post(VaraintUpload.any(), products.addVariant);

router
  .route("/admin_panel/products_management/edit_variant")
  .get(products.vieweditVariant)
  .post(VaraintUpload.any(), products.editVariant);

router
  .route("/admin_panel/products_management/listUnlistVariant/:variantId")
  .put(products.ListUnlistVariant);

// prodcut deleting

router
  .route("/admin_panel/products_management/delete_product")
  .delete(products.deleteProduct);

//==========================Orders Management===============================

router
  .route("/admin_panel/orders")
  .get(orders.view);

router
  .route("/admin_panel/orders/order_details")
  .get(orders.viewOrderDetails)

router.patch('/admin_panel/orders/order_details/changeStatus',orders.changeStatus)

//========================== coupon Management===============================

router
  .route("/admin_panel/coupon_management/add_coupon")
  .get(coupon.viewAddcoupon)
  .post(coupon.addCoupon)

router
  .route('/admin_panel/coupon_management/edit_coupon/:id')
  .get(coupon.viewEditCoupon)
  .put(coupon.editCoupon)

router
  .route('/admin_panel/coupon_management/delete_coupon/:id')
  .delete(coupon.deleteCoupon)

router
  .route('/admin_panel/coupon_management/coupons')
  .get(coupon.viewCoupons)

//========================== sales report ===============================

router
 .route('/admin_panel/salesReport')
 .get(sales.view)

// exporting data as excel

router
 .route('/admin_panel/exportExcel')
 .get(sales.downloadExcel)

router
 .route('/admin_panel/exportPDF')
 .get(sales.downloadPdf)

//========================== offer Management ===============================

router
 .route('/admin_panel/offer_management/offers')
 .get(offer.viewOffers)

router
 .route('/admin_panel/offer_management/add_offer')
 .get(offer.viewAddOffer)
 .post(offer.addOffer)

router
 .route('/admin_panel/category_offer')
 .get(offer.getAllcategory)

router
 .route('/admin_panel/product_offer')
 .get(offer.getAllproduct)
  
router
 .route('/admin_panel/offer_management/update_offer_status/:offerId')
 .patch(offer.changeStatus)

router
 .route('/admin_panel/offer_management/delete_offer/:offerId')
 .delete(offer.deleteOffer)

// global error handler
router.use(errorHandler);

module.exports = router;
