const express = require('express');
const router = express.Router();
const staticRoomMetaTypesJSON = require('../config/metaDataTypes.json');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json(staticRoomMetaTypesJSON);
});

module.exports = router;
