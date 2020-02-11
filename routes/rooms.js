let express = require('express');
let router = express.Router();
const {loggers} = require('winston');
const logger = loggers.get('appLogger');
let exchConn = require('../public/javascripts/exchangeConnector');
let availFactory = require('../public/javascripts/roomAvailabilityFactory');
let roomsFactory = require('../public/javascripts/roomsFactory');
let roomMetaProvider = require('../public/javascripts/roomMetaProvider');
let ews = require('ews-javascript-api');

const config = require('config');
// noinspection JSUnresolvedFunction
let myconfig = config.get('cras.mainSetting');


/* GET home page. */
router.get('/', function (req, res, next) {
    exchConn.GetRooms(myconfig.default_room_user)
        .then(function (roomsResponse) {
            res.json(roomsFactory.RoomsFromResponse(roomsResponse));
        }, function (errors) {
            logger.debug("Error: ", errors);
        });
});

router.get('/:id', function (req, res, next) {
    let id = req.params.id;
    let attendee = [new ews.AttendeeInfo(id)];
    exchConn.GetUserAvailability(attendee)
        .then(function (availabilityResponse) {
            let roomMetaInfo = roomMetaProvider.GetRoomMetaForId(id);
            res.json(availFactory.RoomAvailabilityFrom(availabilityResponse, roomMetaInfo));
        }, function (errors) {
            logger.debug("Error: ", errors);
        });
});

router.get('/:id/meta', function (req, res, next) {
    let id = req.params.id;
    res.json(roomMetaProvider.GetRoomMetaForId(id));
});

module.exports = router;
