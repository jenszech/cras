var express = require('express');
var router = express.Router();
const staticRoomMetaTypesJSON = require('../config/metaDataTypes.json');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.json(staticRoomMetaTypesJSON);
});

module.exports = router;
