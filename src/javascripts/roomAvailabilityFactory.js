const { loggers } = require('winston');
const logger = loggers.get('appLogger');
const staticReplaceJSON = require('../../config/title_replacement.json');
const config = require('config');
// noinspection JSUnresolvedFunction
const myconfig = config.get('cras.mainSetting');

function createTimeObject(hour) {
  const timeObj = new Date();
  timeObj.setHours(hour, 0, 0, 0);
  // timezone fix!
  timeObj.setHours(timeObj.getHours() + 2);
  return timeObj;
}

function createFreeAppointment(startTime, endTime) {
  return {
    startTime: startTime,
    endTime: endTime,
    displayTime: FormatDisplayDates(startTime, endTime),
    title: 'Frei',
    blocked: false,
    isCurrent: isCurrentAppointment(startTime, endTime),
  };
}

function isCurrentAppointment(startDate, endDate) {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + 2);

  return currentDate > startDate && currentDate < endDate;
}

function checkTitleForReplacments(title) {
  let titleStr = title;
  for (const id in staticReplaceJSON.replacement_tag) {
    if (
      // staticReplaceJSON.replacement_tag.hasOwnProperty(id) &&
      {}.hasOwnProperty.call(staticReplaceJSON.replacement_tag, id) &&
      titleStr.includes(staticReplaceJSON.replacement_tag[id].key)
    ) {
      titleStr = staticReplaceJSON.replacement_tag[id].newTitle;
      break;
    }
  }
  return titleStr;
}

exports.RoomAvailabilityFrom = function (uservailability, roomMeta) {
  const appointments = [];
  let lastEndDate = createTimeObject(myconfig.workStart);
  const endWorkingDate = createTimeObject(myconfig.workEnd);

  logger.debug('RoomAvailabilityFrom - Search between ' + lastEndDate + ' to ' + endWorkingDate);

  uservailability.attendeesAvailability.responses[0].calendarEvents.forEach(function (event) {
    // add free slot before appointment (if neccessary)
    const currentStartDate = new Date(event.startTime.originalDateInput);
    if (currentStartDate.getTime() > lastEndDate.getTime()) {
      appointments.push(createFreeAppointment(lastEndDate, new Date(event.startTime.originalDateInput)));
    }

    // add appointment
    const user = ExtractFormatedName(event.details.subject);
    const title = ExtractTitle(event.details.subject, user);
    const appointment = {
      startTime: event.startTime.originalDateInput,
      endTime: event.endTime.originalDateInput,
      displayTime: FormatDisplayDates(
        new Date(event.startTime.originalDateInput),
        new Date(event.endTime.originalDateInput),
      ),
      user: user,
      title: checkTitleForReplacments(title),
      blocked: true,
      isCurrent: isCurrentAppointment(
        new Date(event.startTime.originalDateInput),
        new Date(event.endTime.originalDateInput),
      ),
    };
    appointments.push(appointment);

    // update last end date
    lastEndDate = new Date(event.endTime.originalDateInput);
  });

  // add free slot at the end (if neccessary)
  if (lastEndDate.getTime() < endWorkingDate.getTime()) {
    appointments.push(createFreeAppointment(lastEndDate, endWorkingDate));
  }

  return {
    roomName: roomMeta.room,
    currentTime: FormattedCurrentTime,
    appointments: appointments,
  };
};

/**
 * @return {string}
 */
const FormatDisplayDates = function (startDate, endDate) {
  const formattedStart = FormattedHours(startDate) + ':' + FormattedMinutes(startDate);
  const formattedEnd = FormattedHours(endDate) + ':' + FormattedMinutes(endDate);
  return formattedStart + ' bis ' + formattedEnd;
};

/**
 * @return {string}
 */
const FormattedHours = function (date) {
  return date.getHours() - 2 < 10 ? '0' + date.getHours() - 2 : date.getHours() - 2;
};

/**
 * @return {string}
 */
const FormattedMinutes = function (date) {
  return date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
};

/**
 * @return {string}
 */
const FormattedCurrentTime = function () {
  const currentDate = new Date();
  currentDate.setHours(currentDate.getHours());
  return currentDate.getHours() + ':' + currentDate.getMinutes();
};

/**
 * @return {string}
 */
const ExtractFormatedName = function (title) {
  const match = title.match(/^[A-Zäöüß]+, [A-Zäöüß]+/i);
  if (match == null) return '';
  return match[0];
};

const ExtractTitle = function (title, user) {
  if (user === '') return title;
  return title.substr(user.length + 1);
};
