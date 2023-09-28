const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const {
  createTokenUser,
  attachCookiesToResponse,
  checkPermissions,
} = require("../utils");
const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
  console.log(req.user);
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new customError.NotFoundError(
      `cannot find user with id ${req.params.id}`
    );
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};
const getCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};
//update user with pre.save();
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    throw new customError.BadRequestError("please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  await user.save();
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new customError.BadRequestError("please provide both values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isCorrect = await user.comparePassword(oldPassword);
  if (!isCorrect) {
    throw new customError.UnauthenticatedError("old password is not matched");
  }
  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "password changed succesfully:" });
};
module.exports = {
  getAllUsers,
  getSingleUser,
  getCurrentUser,
  updateUser,
  updateUserPassword,
};
//update user with findOneAndUpdate

// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     throw new customError.BadRequestError("please provide both values");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.userId },
//     { name, email },
//     {
//       new: true,
//       runValidators: true,
//     }
//   );
//   const tokenUser = createTokenUser(user);
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };
