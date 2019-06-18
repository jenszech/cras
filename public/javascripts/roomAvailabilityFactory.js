const { loggers } = require('winston');
const logger = loggers.get('appLogger');

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
          title: "Frei",
          blocked: false  
        }
        appointments.push(freeAppointment)
    }

    // add appointment
    var appointment = {
      startTime: event.startTime.originalDateInput,
      endTime: event.endTime.originalDateInput,
      title: event.details.subject,
      blocked: true
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
      title: "Frei",
      blocked: false  
    }
    appointments.push(freeAppointment)
  }

  return {
        roomName: roomMeta.room,
        appointments: appointments
      };
}
