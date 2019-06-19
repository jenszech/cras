const { loggers } = require('winston');
const logger = loggers.get('appLogger');

function isCurrentAppointment(startDate, endDate) {

    var currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 2);

    if (currentDate > startDate && currentDate < endDate ){
      return true;
    } else{
      return false;
    }
}

exports.RoomAvailabilityFrom = function(uservailability, roomMeta) {

  var appointments = [];

  var lastEndDate = new Date();                     // today
  lastEndDate.setHours(7);                          // working hours start
  lastEndDate.setMinutes(0);
  lastEndDate.setSeconds(0);
  lastEndDate.setMilliseconds(0)
  lastEndDate.setHours(lastEndDate.getHours() + 2); // timezone fix!

  var endWorkingDate = new Date();                  // today
  endWorkingDate.setHours(19);                      // working hours end
  endWorkingDate.setMinutes(0);
  endWorkingDate.setSeconds(0);
  endWorkingDate.setMilliseconds(0)
  endWorkingDate.setHours(endWorkingDate.getHours() + 2);

  uservailability.attendeesAvailability.responses[0].calendarEvents.forEach(function(event){

    // add free slot before appointment (if neccessary)
    var currentStartDate = new Date(event.startTime.originalDateInput);
    if (currentStartDate.getTime() > lastEndDate.getTime()) {
        var freeAppointment = {
          startTime: lastEndDate,
          endTime: event.startTime.originalDateInput,
          displayTime: FormatDisplayDates(lastEndDate, new Date(event.startTime.originalDateInput)),
          title: "Frei",
          blocked: false,
          isCurrent: isCurrentAppointment(new Date(lastEndDate), new Date(event.startTime.originalDateInput))
        }
        appointments.push(freeAppointment)
    }

    // add appointment
    var appointment = {
      startTime: event.startTime.originalDateInput,
      endTime: event.endTime.originalDateInput,
      displayTime: FormatDisplayDates(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput)),
      title: event.details.subject,
      blocked: true,
      isCurrent: isCurrentAppointment(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput))
    }
    appointments.push(appointment);

    // update last end date
    lastEndDate = new Date(event.endTime.originalDateInput);
  });

  // add free slot at the end (if neccessary)
  if (lastEndDate.getTime() < endWorkingDate.getTime()) {
    var freeAppointment = {
      startTime: lastEndDate,
      endTime: endWorkingDate,
      displayTime: FormatDisplayDates(lastEndDate, endWorkingDate),
      title: "Frei",
      blocked: false,
      isCurrent: isCurrentAppointment(new Date(lastEndDate), new Date(endWorkingDate))
    }
    appointments.push(freeAppointment)
  }

  var currentDate = new Date();
  currentDate.setHours(currentDate.getHours());
  let formattedTimeString = currentDate.getHours() + ":" + currentDate.getMinutes();

  return {
        roomName: roomMeta.room,
        currentTime: formattedTimeString,
        appointments: appointments
      };
}

FormatDisplayDates = function(startDate, endDate) {
  var formattedStart = FormattedHours(startDate) + ':' + FormattedMinutes(startDate)
  var formattedEnd = FormattedHours(endDate) + ':' + FormattedMinutes(endDate)
  return formattedStart + ' bis ' + formattedEnd
}

FormattedHours = function(date) {
  return date.getHours() - 2 < 10 ? "0" + date.getHours() - 2 : date.getHours() - 2;
}

FormattedMinutes = function(date) {
   return date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
}
