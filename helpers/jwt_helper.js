const JWT = require("jsonwebtoken");
const createError = require("http-errors");

const client = require("./init_redis");

const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      {},
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1h",
        issuer: "sabinsubedi.com",
        audience: userId,
      },
      (err, token) => {
        if (err) {
          console.error(err.message);
          return reject(createError.InternalServerError());
        }
        return resolve(token);
      }
    );
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) return next(createError.Unauthorized());

  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
    if (err) {
      if (err.name === "JsonWebTokenError") {
        return next(createError.Unauthorized());
      }
      return next(createError.Unauthorized(err.message));
    }

    req.payload = payload;
    next();
  });
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    JWT.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
      if (err) {
        return reject(createError.Unauthorized());
      }

      client.get(payload.aud, (err, reply) => {
        if (err) {
          console.error(err.message);
          reject(createError.InternalServerError());
        }
        if (token === reply) {
          return resolve(payload.aud);
        }
        return reject(createError.Unauthorized());
      });
    });
  });
};

const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    JWT.sign(
      {},
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
        issuer: "sabinsubedi.com",
        audience: userId,
      },
      (err, token) => {
        if (err) {
          console.error(err.message);
          return reject(createError.InternalServerError());
        }
        client.set(userId, token, "EX", 7 * 24 * 60 * 60, (err, reply) => {
          if (err) {
            return reject(createError.InternalServerError());
          }
          return resolve(token);
        });
      }
    );
  });
};

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
