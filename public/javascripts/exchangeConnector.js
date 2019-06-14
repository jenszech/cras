const config = require('config');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');
const { ExchangeService, ExchangeVersion, WebCredentials, Uri, DateTime, CalendarView, WellKnownFolderName, EwsLogging } = require("ews-javascript-api");
EwsLogging.DebugLogEnabled = false;

var myconfig = config.get('cras.exchange');

var ews = require('ews-javascript-api');
var ewsAuth = require("ews-javascript-api-auth");
var exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2010_SP1);

exch.Credentials = new ews.ExchangeCredentials(myconfig.user, myconfig.password);
ews.ConfigurationApi.ConfigureXHR(new ewsAuth.ntlmAuthXhrApi(myconfig.user, myconfig.password));
//set ews endpoint url to use
exch.Url = new ews.Uri(myconfig.url); // you can also use exch.AutodiscoverUrl

exports.GetUserAvailability = function(attendeeInfo) {
    //create timewindow object o request avaiability suggestions for next 48 hours, DateTime and TimeSpan object is created to mimic portion of .net datetime/timespan object using momentjs
    var timeWindow = new ews.TimeWindow(ews.DateTime.Now, ews.DateTime.Now.AddDays(2));
    exch.GetUserAvailability(attendeeInfo, timeWindow, ews.AvailabilityData.FreeBusyAndSuggestions)
        .then(function (availabilityResponse) {
            logger.info("Successful request");
        }, function (errors) {
            logger.debug("Error: ", errors);
        });
}

exports.FindAppointments = function(start, end) {
    var timeslot = new CalendarView(start, end); // appointments in last one week.
    exch
        .FindAppointments(WellKnownFolderName.Calendar, timeslot).then((response) => {
        let appointments = response.Items;
        let appointment = appointments[0];
        logger.debug("Subject: " + appointment.Subject);
        logger.debug("Start Time: " + appointment.Start);
        logger.debug("End Time: " + appointment.End);
        logger.debug("Recipients: ");
        appointment.RequiredAttendees.Items.forEach((a) => {
            logger.debug(a.Address);
        });
        logger.debug("unique id: " + appointment.Id.UniqueId, true, true);

    }, function (error) {
        logger.error(error)
    })
}