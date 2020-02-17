const { loggers } = require('winston');
const logger = loggers.get('appLogger');
const staticReplaceJSON = require('../../config/title_replacement.json');
const config = require('config');
// noinspection JSUnresolvedFunction
let myconfig = config.get('cras.mainSetting');

function createTimeObject(hour) {
    let timeObj = new Date();
    logger.debug('Time ' + timeObj);
    timeObj.setHours(hour);
    timeObj.setMinutes(0);
    timeObj.setSeconds(0);
    timeObj.setMilliseconds(0);
    logger.debug('Time ' + timeObj);
    // timezone fix!
    timeObj.setHours(timeObj.getHours() + 2);
    logger.debug('Time ' + timeObj);
    return timeObj;
}

function createFreeAppointment(startTime, endTime) {
    return {
        startTime: startTime,
        endTime: endTime,
        displayTime: FormatDisplayDates(startTime, endTime),
        title: "Frei",
        blocked: false,
        isCurrent: isCurrentAppointment(startTime, endTime)
    };
}

function isCurrentAppointment(startDate, endDate) {
    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 2);

    return currentDate > startDate && currentDate < endDate;
}

function checkTitleForReplacments(title) {
    let titleStr = title;
    for (let id in staticReplaceJSON.replacement_tag) {
        if (staticReplaceJSON.replacement_tag.hasOwnProperty(id) && (titleStr.includes(staticReplaceJSON.replacement_tag[id].key))) {
            titleStr = staticReplaceJSON.replacement_tag[id].newTitle;
            break;
        }
    }
    return titleStr;
}


exports.RoomAvailabilityFrom = function (uservailability, roomMeta) {
    let appointments = [];

    let lastEndDate = createTimeObject(myconfig.workStart);
    let endWorkingDate = createTimeObject(myconfig.workEnd);

    logger.debug('RoomAvailabilityFrom - Search between ' +lastEndDate + ' to ' + endWorkingDate);

    uservailability.attendeesAvailability.responses[0].calendarEvents.forEach(function (event) {

        // add free slot before appointment (if neccessary)
        let currentStartDate = new Date(event.startTime.originalDateInput);
        if (currentStartDate.getTime() > lastEndDate.getTime()) {
            appointments.push(createFreeAppointment(lastEndDate, new Date(event.startTime.originalDateInput)));
        }

        // add appointment
        let user = ExtractFormatedName(event.details.subject);
        let title = ExtractTitle(event.details.subject, user);
        let appointment = {
            startTime: event.startTime.originalDateInput,
            endTime: event.endTime.originalDateInput,
            displayTime: FormatDisplayDates(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput)),
            user: user,
            title: checkTitleForReplacments(title),
            blocked: true,
            isCurrent: isCurrentAppointment(new Date(event.startTime.originalDateInput), new Date(event.endTime.originalDateInput))
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
        appointments: appointments
    };
};

/**
 * @return {string}
 */
FormatDisplayDates = function (startDate, endDate) {
    let formattedStart = FormattedHours(startDate) + ':' + FormattedMinutes(startDate);
    let formattedEnd = FormattedHours(endDate) + ':' + FormattedMinutes(endDate);
    return formattedStart + ' bis ' + formattedEnd;
};

/**
 * @return {string}
 */
FormattedHours = function (date) {
    return date.getHours() - 2 < 10 ? "0" + date.getHours() - 2 : date.getHours() - 2;
};

/**
 * @return {string}
 */
FormattedMinutes = function (date) {
    return date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
};

/**
 * @return {string}
 */
FormattedCurrentTime = function () {
    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours());
    return currentDate.getHours() + ":" + currentDate.getMinutes();
};

/**
 * @return {string}
 */
ExtractFormatedName = function (title) {
    let match = title.match(/^[A-Zäöüß]+, [A-Zäöüß]+/i);
    if (match == null) return "";
    return match[0];
};

ExtractTitle = function (title, user) {
    if (user === "") return title;
    return title.substr(user.length+1);
};