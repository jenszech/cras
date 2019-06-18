var roomMetaProvider = require('../../public/javascripts/roomMetaProvider');

exports.RoomsFromResponse = function(roomsResponse) {
  var rooms = [];

  roomsResponse.forEach( function(element) {
    let room = {
      id: element.address,
      name: element.name,
      meta: roomMetaProvider.GetRoomMetaForId(element.address)
    }

    rooms.push(room);
  });

  return rooms;
}
