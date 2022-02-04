require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const createError = require("http-errors");
const authRoute = require("./routes/Auth.route");
const { verifyAccessToken } = require("./helpers/jwt_helper");
require("./helpers/init_mongodb");
require("./helpers/init_redis");

const app = express();
app.use(express.json());
app.use(morgan("dev"));

app.get("/", verifyAccessToken, async (req, res) => {
  res.send("Hello World");
});

app.use("/auth", authRoute);

app.use(async (req, res, next) => {
  next(createError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message || "Internal Server Error",
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
