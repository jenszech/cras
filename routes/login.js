const express = require('express');
const router = express.Router();
const auth = require('./auth');
// const { loggers } = require('winston');
// const logger = loggers.get('appLogger');
const userMap = require('../src/javascripts/model/usersMap');
const User = require('../src/javascripts/model/users');

/* GET Validate existing token */
router.get('/', auth.isValidateToken, function (req, res, next) {
  const response = auth.getValidateUser(req, res);
  res.send(response);
});


// POST login route
router.post('/', (req, res, next) => {
  const {
    body: { user },
  } = req;

  if (!user.email) {
    return res.status(422).json(getErrorResponse('email is required'));
  }

  if (!user.password) {
    return res.status(422).json(getErrorResponse('password is required'));
  }

  const userData = userMap.getByLogin(user.email);
  if (userData) {
    if (userData.validatePassword(user.password)) {
      userData.generateJWT();
      return res.json({ user: userData.toAuthJSON() });
    }
    res.sendStatus(401);
  }
  res.sendStatus(404);
});

/* POST Add new User */
router.post('/add', auth.isValidateToken, function (req, res, next) {
  const response = auth.getValidateUser(req, res);
  if (response.status===200){
    const {
      body: { user },
    } = req;

    if (!user.email) {
      return res.status(422).json(getErrorResponse('email is required'));
    }

    if (!user.password) {
      return res.status(422).json(getErrorResponse('password is required'));
    }

    if (userMap.getByLogin(user.email)) {
      return res.status(422).json(getErrorResponse('allready exists'));
    }

    const newUser = new User(userMap.getNextId(), user.email);
    newUser.setPassword(user.password);
    userMap.updateMap(newUser);
    userMap.storeUserToFile();
    res.send(newUser.toIdJSON());
  } else {
    res.send(response);
  }
});

// -- Helper Functions --------------------------------
function getErrorResponse(msg) {
  return {
    errors: {
      errMsg: msg,
    },
  };
}

module.exports = router;
