const User = require("../models/user");
const { StatusCodes } = require("http-status-codes");
const customError = require("../errors");
const jwt = require("jsonwebtoken");
const { createTokenUser, attachCookiesToResponse } = require("../utils");
const register = async (req, res) => {
  const { email, name, password } = req.body;
  const emailALreadyExists = await User.findOne({ email });
  if (emailALreadyExists) {
    throw new customError.BadRequestError("email already exists");
  }
  const isFirstAccount = (await User.countDocuments({})) === 0;
  //  console.log(isFirstAccount);
  const role = isFirstAccount ? "admin" : "user";

  const user = await User.create({ name, email, password, role });
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new customError.BadRequestError("please provide credentials");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }
  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};
const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "user logout succesfully" });
};
module.exports = { register, login, logout };
