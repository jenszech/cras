const config = require('config');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');
const { ExchangeService, ExchangeVersion, WebCredentials, Uri, DateTime, CalendarView, WellKnownFolderName, EwsLogging, EmailAddress, Appointment, SendInvitationsMode } = require("ews-javascript-api");
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
    var timeWindow = new ews.TimeWindow(ews.DateTime.Now, ews.DateTime.Now.AddDays(1));
    return exch.GetUserAvailability(attendeeInfo, timeWindow, ews.AvailabilityData.FreeBusyAndSuggestions);
}

exports.GetRoomLists = function() {
    exch.GetRoomLists()
        .then(function (roomListResponse) {
          var json = JSON.stringify(roomListResponse);
            logger.info("Successful room list request" + json);
        }, function (errors) {
            logger.debug("Error: ", errors);
        });
}

exports.GetRooms = function(name) {
  var emailAddress = new EmailAddress(name)
    return exch.GetRooms(emailAddress);
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






exports.CreateAppointment = function(roomId, roomName) {

        var lastEndDate = new Date();                     // today
        lastEndDate.setHours(15);                          // working hours start
        lastEndDate.setMinutes(0);
        lastEndDate.setSeconds(0);
        lastEndDate.setMilliseconds(0)
        lastEndDate.setHours(lastEndDate.getHours() + 2); // timezone fix!
        var endWorkingDate = new Date();                  // today
        endWorkingDate.setHours(16);                      // working hours end
        endWorkingDate.setMinutes(0);
        endWorkingDate.setSeconds(0);
        endWorkingDate.setMilliseconds(0)
        endWorkingDate.setHours(endWorkingDate.getHours() + 2);
        
        var appointment = new ews.Appointment(exch);

        appointment.Subject = "Besprechung-Blocker";
        appointment.Body = new ews.TextBody("Dies ist ein Blocker, für eine Besprechung, der direkt Vor-Ort eingestellt wurde.");
        appointment.Start = new ews.DateTime("20190618T160000");
        appointment.End = appointment.Start.Add(1, "h");
        appointment.Location = roomName;
        appointment.RequiredAttendees.Add(roomId);

        appointment.Save(ews.SendInvitationsMode.SendToAllAndSaveCopy).then(function () {
            logger.debug("done - check email");
        }, function (error) {
            logger.debug(error);
        });
}
