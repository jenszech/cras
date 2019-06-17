exports.RoomAvailabilityFrom = function(uservailability) {
  var appointments = [];
  uservailability.attendeesAvailability.responses[0].calendarEvents.forEach(function(event){
    var appointment = {
      startTime: event.startTime.originalDateInput,
      endTime: event.endTime.originalDateInput,
      title: event.details.subject
    }
    appointments.push(appointment);
  });
  return {
        roomName: "Raum Marie",
        appointments: appointments
      };
}
