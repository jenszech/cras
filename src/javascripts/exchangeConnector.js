const config = require('config');
const { loggers } = require('winston');
const logger = loggers.get('appLogger');
// const {ExchangeService, ExchangeVersion, WebCredentials, Uri, DateTime, CalendarView, WellKnownFolderName, EwsLogging, EmailAddress, Appointment, SendInvitationsMode} = require("ews-javascript-api");
const { EwsLogging, EmailAddress, CalendarView, WellKnownFolderName } = require('ews-javascript-api');
EwsLogging.DebugLogEnabled = false;

// noinspection JSUnresolvedFunction
const myconfig = config.get('cras.exchange');
const ews = require('ews-javascript-api');
const ewsAuth = require('ews-javascript-api-auth');
let exch;

exports.InitExchangeConnector = function () {
  exch = new ews.ExchangeService(ews.ExchangeVersion.Exchange2010_SP1);

  // noinspection JSValidateTypes
  exch.Credentials = new ews.ExchangeCredentials(myconfig.user, myconfig.password);
  ews.ConfigurationApi.ConfigureXHR(new ewsAuth.ntlmAuthXhrApi(myconfig.user, myconfig.password));
  // set ews endpoint url to use
  exch.Url = new ews.Uri(myconfig.url); // you can also use exch.AutodiscoverUrl
};

exports.GetRooms = function (name) {
  return exch.GetRooms(new EmailAddress(name));
};

exports.GetUserAvailability = function (attendeeInfo) {
  // create timewindow object o request avaiability suggestions for next 48 hours, DateTime and TimeSpan object is created to mimic portion of .net datetime/timespan object using momentjs
  const timeWindow = new ews.TimeWindow(ews.DateTime.Now, ews.DateTime.Now.AddDays(1));
  return exch.GetUserAvailability(attendeeInfo, timeWindow, ews.AvailabilityData.FreeBusy);
};

exports.GetRoomLists = function () {
  exch.GetRoomLists().then(
    function (roomListResponse) {
      const json = JSON.stringify(roomListResponse);
      logger.info('Successful room list request' + json);
    },
    function (errors) {
      logger.debug('Error: ', errors);
    },
  );
};

exports.FindAppointments = function (start, end) {
  const timeslot = new CalendarView(start, end); // appointments in last one week.
  exch.FindAppointments(WellKnownFolderName.Calendar, timeslot).then(
    (response) => {
      const appointments = response.Items;
      const appointment = appointments[0];
      logger.debug('Subject: ' + appointment.Subject);
      logger.debug('Start Time: ' + appointment.Start);
      logger.debug('End Time: ' + appointment.End);
      logger.debug('Recipients: ');
      appointment.RequiredAttendees.Items.forEach((a) => {
        logger.debug(a.Address);
      });
      logger.debug('unique id: ' + appointment.Id.UniqueId, true, true);
    },
    function (error) {
      logger.error(error);
    },
  );
};

exports.CreateAppointment = function (roomId, roomName, start, duration) {
  const appointment = new ews.Appointment(exch);

  appointment.Subject = 'Besprechung-Blocker';
  appointment.Body = new ews.TextBody(
    'Dies ist ein Blocker, für eine Besprechung, der direkt Vor-Ort eingestellt wurde.',
  );
  appointment.Start = new ews.DateTime(start);
  appointment.End = new ews.DateTime(start);
  appointment.End = appointment.End.Add(duration, 'minute');
  appointment.Location = roomName;
  appointment.RequiredAttendees.Add(roomId);
  appointment.Save(ews.SendInvitationsMode.SendToAllAndSaveCopy).then(
    function () {
      logger.debug('done - check email - ' + appointment.Start.toString() + ' - ' + appointment.End.toString());
    },
    function (error) {
      logger.debug(error);
    },
  );
};
