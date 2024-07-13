const express = require("express");
const router = express.Router();
const signUp = require("../controllers/users/signUp");
const signIn = require("../controllers/users/singnIn");
const userAuth = require("../middlewares/user/userAuth");
const googleAuth = require("../controllers/users/googlesingIn&up");
const profile = require("../controllers/users/profile");
const address = require("../controllers/users/address");
const landingPage = require("../controllers/index/landingPage");
const productDetails = require("../controllers/index/productDetails");
const productList = require("../controllers/index/products");
const logOut = require("../controllers/users/logout");
const cart = require("../controllers/users/cart");
const checkout = require("../controllers/users/checkout");
const orderTracking = require("../controllers/users/orderTraking");
const orderListing = require("../controllers/users/ordersListing");
const wallet = require("../controllers/users/wallet");
const wishList = require("../controllers/users/wishList");
const { errorHandler } = require("../utils/errorHandler");

//===================landing page=====================
router.get("/", userAuth.is_notBlocked, landingPage.viewLandingPage);

//===================Prodcut Details==================
router.route("/product_details").get(productDetails.viewProductDetails);

router.post("/variantColorImages", productDetails.getImages);

//================== COLLECTION , SEARCH, SORT, FILTER ======================
router.route("/products").get(productList.view);

//==========================signUp=============================

router
  .route("/signUp")
  .get(userAuth.isLoggedInd, signUp.viewSignUp)
  .post(signUp.registerUser);

//===========================OTP================================

router
  .route("/otp_verification")
  .get(userAuth.isLoggedInd, signUp.otpPage)
  .post(signUp.otpVerification);

// resend otp
router.get("/resend_otp", signUp.resendOtp);

//===========================signIn==============================

router
  .route("/signIn")
  .get(userAuth.is_login, signIn.viewSignIn)
  .post(signIn.userSignIn);

//======================Google signIn&signUp =====================

router.route("/google_authentication").post(googleAuth.insertUser);

//====================== user profile route ======================

router.route("/user_profile").get(userAuth.isProfileAllowed, profile.view);

router
  .route("/user_profile/edit-name-gender")
  .put(userAuth.isjwTavailable, profile.editProfileDataGenderName);

router
  .route("/user_profile/editPhone")
  .patch(userAuth.isjwTavailable, profile.editPhone);

router
  .route('/changePassword')
  .patch(userAuth.notBlocked_haveJwt,profile.changePassword)

//================ User Addresses Route ==========================

router.route("/user_profile/add_address").post(address.addAddress);

router.route("/user_profile/edit_address").put(address.editAddress);

router.route("/user_profile/delete_address").delete(address.deleteAddress);

router.route("/logOut").get(logOut.logOut);

//================ User cart Routes ==========================

router
  .route("/cart")
  .get(userAuth.isProfileAllowed, cart.viewCart)
  .post(userAuth.notBlocked_haveJwt, cart.storeCartData)
  .delete(userAuth.notBlocked_haveJwt, cart.deleteItem);

// checking stock available in varinat when increasing the count
router.patch(
  "/isStockAvailableinVariantStock",
  cart.isStockAvailableinVariantStock
);

router.get("/viewCartinProduct", cart.getCartDatas);

//================ User checkout Routes ==========================

router
  .route("/checkOut")
  .get(userAuth.isProfileAllowed, checkout.view)
  .post(userAuth.notBlocked_haveJwt, checkout.saveOrder);

router.post("/paymentSuccess", checkout.verifyPayment);

//================ User checkout orderTracking ==========================

router
  .route("/orderTracking")
  .get(userAuth.isProfileAllowed, orderTracking.view);

// order listing
router
  .route("/orders")
  .get(userAuth.isProfileAllowed, orderListing.viewOrdersList);

router
  .route("/cancel-product")
  .post(userAuth.isProfileAllowed, orderTracking.cancelProduct);

router
  .route("/return-product")
  .post(userAuth.notBlocked_haveJwt, orderTracking.returnProdcut);

router
  .route("/rePayment")
  .post( orderTracking.rePay);

router.get('/download-invoice',orderTracking.invoiceDownload)

//================ User wallet ==========================

router.route("/wallet").get(userAuth.isProfileAllowed, wallet.view);

//================ User wishlist ==========================

router.route("/wishList").get(userAuth.isProfileAllowed,wishList.view);

router.route("/wishList/add").post(wishList.addTowishList);

router.route("/wishList/delete").delete(wishList.deleteItem);

router.use(errorHandler);
module.exports = router;
