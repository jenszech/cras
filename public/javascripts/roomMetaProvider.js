const staticRoomsMetaJSON = require('../../config/roommeta.json');

exports.GetRoomMetaForId = function (roomId) {
    let filteredRooms = staticRoomsMetaJSON.rooms.filter(room => room.id === roomId);
    if (filteredRooms.length > 0) {
        return filteredRooms[0];
    } else {
        return {
            error: "No metadata found"
        }
    }
};
