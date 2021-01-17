const express = require('express');
const router = express.Router();
const { loggers } = require('winston');
const logger = loggers.get('appLogger');
const exchConn = require('../src/javascripts/exchangeConnector');
const availFactory = require('../src/javascripts/roomAvailabilityFactory');
const roomsFactory = require('../src/javascripts/roomsFactory');
const roomMetaProvider = require('../src/javascripts/roomMetaProvider');
const ews = require('ews-javascript-api');

const config = require('config');
// noinspection JSUnresolvedFunction
const myconfig = config.get('cras.mainSetting');

/* GET home page. */
router.get('/', function (req, res, next) {
  exchConn.GetRooms(myconfig.default_room_user).then(
    function (roomsResponse) {
      res.json(roomsFactory.RoomsFromResponse(roomsResponse));
    },
    function (errors) {
      logger.debug('Error: ', errors);
    },
  );
});

router.get('/:id', function (req, res, next) {
  const id = req.params.id;
  const attendee = [new ews.AttendeeInfo(id)];
  exchConn.GetUserAvailability(attendee).then(
    function (availabilityResponse) {
      const roomMetaInfo = roomMetaProvider.GetRoomMetaForId(id);
      res.json(availFactory.RoomAvailabilityFrom(availabilityResponse, roomMetaInfo));
    },
    function (errors) {
      logger.debug('Error: ', errors);
    },
  );
});

router.put('/:id', function (req, res, next) {
  const id = req.params.id;
  const start = req.query.start;
  const duration = parseInt(req.query.duration);
  const roomName = req.query.room;
  exchConn.CreateAppointment(id, roomName, start, duration);
  res.send({ booked: true });
});

router.get('/:id/meta', function (req, res, next) {
  const id = req.params.id;
  res.json(roomMetaProvider.GetRoomMetaForId(id));
});

module.exports = router;
