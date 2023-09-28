const Product = require("../models/product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");
const { login } = require("./authcontroller");
const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOne({ _id: productId }).populate("reviews");
  if (!product) {
    throw new CustomError.NotFoundError(
      `no product found with id ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findByIdAndUpdate(
    { _id: productId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!product) {
    throw new CustomError.NotFoundError(
      `no product found with id ${productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: productId } = req.params;
  const product = await Product.findOneAndDelete({ _id: productId });
  if (!product) {
    throw new CustomError.NotFoundError(
      `no product found with id ${productId}`
    );
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "success! product removed" });
};
const uploadImage = async (req, res) => {
  // console.log(req.files);
  if (!req.files) {
    throw new CustomError.BadRequestError("please upload file");
  }
  const productImage = req.files.image;
  // console.log(productImage.mimetype.startsWith("image"));
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("please upload image");
  }
  const maxSize = 1024 * 1024;
  // console.log(productImage.size);
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError(
      `please upload image smaller than 1MB`
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  // console.log(imagePath);
  await productImage.mv(imagePath);
  res
    .status(StatusCodes.CREATED)
    .json({ image: `/uploads/${productImage.name}` });
};
module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
