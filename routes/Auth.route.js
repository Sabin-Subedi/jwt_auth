const express = require("express");
const createError = require("http-errors");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../helpers/jwt_helper");
const { authSchema } = require("../helpers/validation_schema");
const User = require("../models/User.model");
const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = await authSchema.validateAsync(req.body);

    const userExist = await User.findOne({ email });

    if (userExist) {
      throw createError.Conflict("User already exist");
    }

    const user = new User({ email, password });
    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) {
      error.status = 422;
    }
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = await authSchema.validateAsync(req.body);

    const user = await User.findOne({ email });

    if (!user) {
      throw createError.NotFound("User not registered");
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      throw createError.Unauthorized("Incorrect email or  password");
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);

    res.send({ accessToken, refreshToken });
  } catch (error) {
    if (error.isJoi === true) {
      return next(createError.BadRequest("Invalid email or password"));
    }
    next(error);
  }
});

router.delete("/logout", async (req, res, next) => {
  res.send("logout");
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw createError.BadRequest();
    const userId = await verifyRefreshToken(refreshToken.split(" ")[1]);

    const token = await signRefreshToken(userId);
    res.send({ refreshToken: token });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
