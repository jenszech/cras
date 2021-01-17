const roomMetaProvider = require('./roomMetaProvider');

exports.RoomsFromResponse = function (roomsResponse) {
  const rooms = [];

  roomsResponse.forEach(function (element) {
    const room = {
      id: element.address,
      name: element.name,
      meta: roomMetaProvider.GetRoomMetaForId(element.address),
    };
    rooms.push(room);
  });

  return rooms;
};
