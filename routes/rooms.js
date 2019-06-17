var express = require('express');
var router = express.Router();
var exchConn = require('../public/javascripts/exchangeConnector');
var availFactory = require('../public/javascripts/roomAvailabilityFactory');
var ews = require('ews-javascript-api');

const DEFAULT_ROOM_USER = "V_TDE_B_Raumliste@tde.thalia.de";

/* GET home page. */
router.get('/', function(req, res, next) {
  exchConn.GetRooms(DEFAULT_ROOM_USER)
  .then(function (roomsResponse) {
      res.json(roomsResponse)
  }, function (errors) {
      logger.debug("Error: ", errors);
  });
});

router.get('/:id', function(req, res, next) {
  var id = req.params.id

  var attendee =[ new ews.AttendeeInfo(id)];
  exchConn.GetUserAvailability(attendee)
  .then(function (availabilityResponse) {
      res.json(availFactory.RoomAvailabilityFrom(availabilityResponse));
  }, function (errors) {
      logger.debug("Error: ", errors);
  });
});

module.exports = router;
