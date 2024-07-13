const asyncHandler = require("express-async-handler");
const {
  OK,
  CONFLICT,
  FORBIDDEN,
  NOT_FOUND,
} = require("../../utils/statuscodes");
const cartCLTN = require("../../modles/users/cart");
const productVariantCLTN = require("../../modles/admin/productsVariantsMd");
const productCLTN = require("../../modles/admin/productModal");
const jwt = require("jsonwebtoken");

// cart view

exports.viewCart = asyncHandler(async (req, res) => {
  const userId = jwt.decode(req.cookies.jwtToken).userId;
  const cartItems = await cartCLTN
    .findOne({ userId })
    .populate("products.productId")
    .populate("products.variantId");


  const latestProducts = await productCLTN.find({}).sort({createdDate:-1}).limit(8).populate('offer')


  for(let product of latestProducts) {
        const variantPrice = await productVariantCLTN.findOne({productId:product._id},{_id:0,prices:1})
 
        product.originalPrice = variantPrice.prices[0]
  }


  res
    .status(OK)
    .render("./user/profile/partials/cart", { cartItems: cartItems ,latestProducts});
});

// accessing cart datas in other pages
exports.getCartDatas = asyncHandler(async (req, res) => {
  const userId = jwt.decode(req.cookies.jwtToken).userId;
  const cartItems = await cartCLTN
    .findOne({ userId: userId })
    .populate("products.variantId");

  if (cartItems && cartItems.products.length>0) {
    return res.status(OK).json({ success: true, cartItems: cartItems });
  }

  res.status(NOT_FOUND).json({ success: false, message: "Cart Is Empty" });
});

// adding to cartdatas to other pages
exports.storeCartData = asyncHandler(async (req, res) => {
  if (req.cookies && !req.cookies.jwtToken) {
    return res.status(FORBIDDEN).json({});
  }

  const { productName, selectedColor, selectedSize, productPrice, productId } =
    req.body;

  const userId = jwt.decode(req.cookies.jwtToken).userId;
  const product = await productCLTN.findOne({ _id: productId });
  const variant = await productVariantCLTN.findOne({
    productId: productId,
    color: selectedColor,
  });

  if (variant.is_delete || product.is_deleted) {
    return res
      .status(FORBIDDEN)
      .json({ message: "This item is currently unavailable" });
  }

  const userexiCart = await cartCLTN.findOne({ userId });

  const isVariantThereInCart = userexiCart?.products.some(
    (product) =>
      product.productId.toString() === productId &&
      product.variantId.toString() === variant._id.toString() &&
      product.variantColor === selectedColor &&
      product.variantSize === selectedSize
  );

  if (isVariantThereInCart) {
    return res.status(OK).json({
      success: false,
      message: "the product is already added to cart, checkout your cart",
    });
  }

  // finding the user cart
  let userCart = await cartCLTN.findOne({ userId });

  if (userCart) {
    userCart.products.push({
      productName,
      productId,
      variantId: variant._id,
      variantPrice: productPrice,
      variantSize: selectedSize,
      variantColor: selectedColor,
    });
  } else {
    userCart = new cartCLTN({
      userId: userId,
      products: [
        {
          productName,
          productId,
          variantId: variant._id,
          variantPrice: productPrice,
          variantSize: selectedSize,
          variantColor: selectedColor,
        },
      ],
    });
  }

  const newcart = await userCart.save();

  res.status(OK).json({
    success: true,
    message: "Product added to Cart , Click Ok to view updates",
  });
});

// checking stock available in varinat when increasing the count
exports.isStockAvailableinVariantStock = asyncHandler(async (req, res) => {
  const { size, variantId, currentCount } = req.body;
  const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;

  const variant = await productVariantCLTN
    .findOne({ _id: variantId })
    .populate("productId");
  const stockIndex = variant.sizes.indexOf(size);

  if (variant.is_delete || variant.productId.is_deleted) {
    if (
      (!variant.is_delete && variant.productId.is_deleted) ||
      (variant.is_delete && variant.productId.is_deleted)
    ) {
      return res
        .status(FORBIDDEN)
        .json({ success: false, message: "This product is not available" });
    }
    if (variant.is_delete && !variant.productId.is_deleted) {
      return res
        .status(FORBIDDEN)
        .json({ success: false, message: "This variant is not available" });
    }
  }

  if (variant.stocks[stockIndex] >= currentCount) {
  

    const cart = await cartCLTN.findOne({ userId: userId });
    let updatedVariant = "";

    for (let i = 0; i < cart.products.length; i++) {
      let variant = cart.products[i];
      if (variant.variantId == variantId && variant.variantSize == size) {
        variant.quantity = currentCount;
        updatedVariant = variant;
        console.log(variant);
        break; // Exit the loop once the condition is met
      }
    }

    const updatedCart = await cart.save();

    return res.status(OK).json({ success: true, variant: updatedVariant });
  } else if (
    variant.stocks[stockIndex] < currentCount &&
    variant.stocks[stockIndex] !== 0
  ) {
    const cart = await cartCLTN.findOne({ userId: userId });
    let updatedVariant = "";

    for (let i = 0; i < cart.products.length; i++) {
      let prodvariant = cart.products[i];
      if (
        prodvariant.variantId == variantId &&
        prodvariant.variantSize == size
      ) {
        prodvariant.quantity = variant.stocks[stockIndex];
        updatedVariant = variant;
        console.log(prodvariant);
        break; // Exit the loop once the condition is met
      }
    }

    const updatedCart = await cart.save();
    return res.status(CONFLICT).json({
      success: false,
      message: "stockless",
      currentStock: variant.stocks[stockIndex],
    });
  } else if (variant.stocks[stockIndex] === 0) {
    return res.status(CONFLICT).json({ success: false });
  }
});

exports.deleteItem = asyncHandler(async (req, res) => {
  const { variantId, variantSize } = req.body;

  const userId = jwt.verify(req.cookies.jwtToken, process.env.JWT_KEY).userId;

  await cartCLTN.updateOne(
    { userId: userId },
    { $pull: { products: { variantId: variantId, variantSize: variantSize } } }
  );

  res.status(OK).json({ success: true });
});
