const { OK, UNAUTHORIZED, CONFLICT } = require("../../utils/statuscodes");
const asyncHandler = require("express-async-handler");
const couponCLTN = require("../../modles/admin/coupon");

// view add coupon
exports.viewAddcoupon = asyncHandler(async (req, res) => {
  res.status(OK).render("./admin/partials/coupon/addCoupon");
});

// add coupon
exports.addCoupon = asyncHandler(async (req, res) => {
  const {
    name,
    discountPercentage,
    minPurchase,
    maxDiscount,
    startDate,
    expirationDate,
  } = req.body;

  console.log(req.body);

  const regexPattern = new RegExp(`^${name}$`, "i");

  const isDuplicateAvail = await couponCLTN.findOne({ name: regexPattern });

  if (isDuplicateAvail) {
    return res
      .status(CONFLICT)
      .json({ success: false, message: "there is a same coupon in this code" });
  }

  const newCuopon = new couponCLTN({
    name,
    discount: discountPercentage,
    minPurchase,
    MaximumRedeemable: maxDiscount,
    startDate,
    expirationDate,
  });

  await newCuopon.save();

  res.status(OK).json({ success: true });
});

// view all coupons
exports.viewCoupons = asyncHandler(async (req, res) => {
  const allCoupons = await couponCLTN.find({});
  console.log(allCoupons);
  res
    .status(OK)
    .render("./admin/partials/coupon/listCoupon", { allCoupons });
});

// view edit coupon
exports.viewEditCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const coupon = await couponCLTN.findOne({ _id: id });

  res.status(OK).render("./admin/partials/coupon/editCoupon", { coupon });
});



// Edit Coupon
exports.editCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    discountPercentage,
    minPurchase,
    MaximumRedeemable,
    startDate,
    expirationDate,
  } = req.body;

  const regexPattern = new RegExp(`^${name}$`, "i");

 
  const isDuplicateAvail = await couponCLTN.findOne({
    name: regexPattern,
    _id: { $ne: id }, // exclude the current coupon
  });

  if (isDuplicateAvail) {
    return res
      .status(CONFLICT)
      .json({
        success: false,
        message: "A coupon with this name already exists",
      });
  }

  const updatedCoupon = await couponCLTN.findByIdAndUpdate(
    id,
    {
      name,
      discount: discountPercentage,
      minPurchase,
      MaximumRedeemable,
      startDate,
      expirationDate,
    },
    { new: true }
  );

  if (!updatedCoupon) {
    return res
      .status(NOT_FOUND)
      .json({ success: false, message: "Coupon not found" });
  }

  res.status(OK).json({ success: true, data: updatedCoupon });
});


// delete coopon 
exports.deleteCoupon = asyncHandler(async(req,res)=> {
  
  const {id} = req.params
  await couponCLTN.deleteOne({_id:id})
  res.status(OK).json({success:true,messagge:'Coupon deleted successfully'})

})
