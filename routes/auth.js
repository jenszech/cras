const jwt = require('jsonwebtoken');
// const { loggers } = require('winston');
// const logger = loggers.get('appLogger');

const secret = 'secret';

const isValidateToken = (req, res, next) => {
  const check = getValidateUser(req, res);
  if (check.status !== 200) {
    res.send(check.status, check);
  } else {
    next();
  }
};

const getValidateUser = function (req, res) {
  const token = getTokenFromHeaders(req, res);
  try {
    if (token.status !== 200) {
      return token;
    } else {
      const decoded = jwt.verify(token.payload, secret, { ignoreExpiration: false });
      return getReturnObj(decoded, 200, null);
    }
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return getReturnObj(null, 401, 'token expired');
    } else {
      return getReturnObj(null, 404, err);
    }
  }
};

const getTokenFromHeaders = function (req) {
  const {
    headers: { authorization },
  } = req;
  if (!authorization) {
    return getReturnObj(null, 404, 'Missing authorisation header');
  }
  const token = authorization.split(' ');
  if (authorization.split(' ')[0] === 'Token') {
    if (token.length === 2) {
      return getReturnObj(authorization.split(' ')[1], 200, null);
    } else {
      return getReturnObj(null, 404, 'invalid token formart');
    }
  } else {
    return getReturnObj(null, 404, 'Missing token');
  }
};

const getReturnObj = function (payload, status, errMsg) {
  return {
    status: status,
    payload: payload,
    errors: {
      errMsg,
    },
  };
};

module.exports.isValidateToken = isValidateToken;
module.exports.getValidateUser = getValidateUser;
