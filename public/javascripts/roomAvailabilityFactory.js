exports.RoomAvailabilityFrom = function(uservailability, roomMeta) {
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
        roomName: roomMeta.room,
        appointments: appointments
      };
}
