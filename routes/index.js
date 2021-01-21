const express = require('express');
const router = express.Router();
const pjson = require('../package.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: pjson.name, version: pjson.version });
});

module.exports = router;
