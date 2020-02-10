//const { loggers } = require('winston');
//const logger = loggers.get('appLogger');
const staticReplaceJSON = require('../../config/title_replacement.json');

function isCurrentAppointment(startDate, endDate) {

    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 2);

    return currentDate > startDate && currentDate < endDate;
}

exports.RoomAvailabilityFrom = function (uservailability, roomMeta) {

    let appointments = [];

    let lastEndDate = new Date();                     // today
    lastEndDate.setHours(7);                          // working hours start
    lastEndDate.setMinutes(0);
    lastEndDate.setSeconds(0);
    lastEndDate.setMilliseconds(0);
    lastEndDate.setHours(lastEndDate.getHours() + 2); // timezone fix!

    let endWorkingDate = new Date();                  // today
    endWorkingDate.setHours(19);                      // working hours end
    endWorkingDate.setMinutes(0);
    endWorkingDate.setSeconds(0);
    endWorkingDate.setMilliseconds(0);
    endWorkingDate.setHours(endWorkingDate.getHours() + 2);

    uservailability.attendeesAvailability.responses[0].calendarEvents.forEach(function (event) {

        // add free slot before appointment (if neccessary)
        let currentStartDate = new Date(event.startTime.originalDateInput);
        if (currentStartDate.getTime() > lastEndDate.getTime()) {
            let freeAppointment = {
                startTime: lastEndDate,
                endTime: event.startTime.originalDateInput,
                displayTime: FormatDisplayDates(lastEndDate, new Date(event.startTime.originalDateInput)),
                title: "Frei",
                blocked: false,
                isCurrent: isCurrentAppointment(new Date(lastEndDate), new Date(event.startTime.originalDateInput))
            };
            appointments.push(freeAppointment)
        }

        // add appointment
        let titleStr = event.details.subject;
        for (let id in staticReplaceJSON.replacement_tag) {
            if (staticReplaceJSON.replacement_tag.hasOwnProperty(id) && (titleStr.includes(staticReplaceJSON.replacement_tag[id].key))) {
                titleStr = staticReplaceJSON.replacement_tag[id].newTitle;
                break;
            }
        }
        let appointment = {
            startTime: event.startTime.originalDateInput,
            endTime: event.endTime.originalDateInput,
            displayTime: FormatDisplayDates(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput)),
            title: titleStr,
            blocked: true,
            isCurrent: isCurrentAppointment(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput))
        };
        appointments.push(appointment);

        // update last end date
        lastEndDate = new Date(event.endTime.originalDateInput);
    });

    // add free slot at the end (if neccessary)
    if (lastEndDate.getTime() < endWorkingDate.getTime()) {
        let freeAppointment = {
            startTime: lastEndDate,
            endTime: endWorkingDate,
            displayTime: FormatDisplayDates(lastEndDate, endWorkingDate),
            title: "Frei",
            blocked: false,
            isCurrent: isCurrentAppointment(new Date(lastEndDate), new Date(endWorkingDate))
        };
        appointments.push(freeAppointment)
    }

    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours());
    let formattedTimeString = currentDate.getHours() + ":" + currentDate.getMinutes();

    return {
        roomName: roomMeta.room,
        currentTime: formattedTimeString,
        appointments: appointments
    };
};

FormatDisplayDates = function (startDate, endDate) {
    let formattedStart = FormattedHours(startDate) + ':' + FormattedMinutes(startDate);
    let formattedEnd = FormattedHours(endDate) + ':' + FormattedMinutes(endDate);
    return formattedStart + ' bis ' + formattedEnd;
};

FormattedHours = function (date) {
    return date.getHours() - 2 < 10 ? "0" + date.getHours() - 2 : date.getHours() - 2;
};

FormattedMinutes = function (date) {
    return date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
};
