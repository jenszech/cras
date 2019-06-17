exports.RoomsFrom = function(roomsResponse) {
  var rooms = [];

  roomsResponse.forEach( function(element) {
    let room = {
      id: element.address,
      name: element.name
    }

    rooms.push(room);
  });

  return rooms;
}
