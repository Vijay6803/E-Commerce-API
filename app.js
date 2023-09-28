require("dotenv").config();
require("express-async-errors"); //use to apply try catch block to all contollers

const express = require("express");
const app = express();
const morgan = require("morgan");
const connectDB = require("./db/connect");
const authRouter = require("./routes/authroutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
app.use(morgan("tiny")); //use for display route detail on console
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());
app.get("/", (req, res) => {
  res.send("e-commerce-api");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.get("/api/v1", (req, res) => {
  // console.log(req.cookies);
  // console.log(req.signedCookies);
  res.send("e-commerce-api");
});
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`server is listening on port ${port}...`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
