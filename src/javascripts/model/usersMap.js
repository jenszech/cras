class UserMap {
  constructor() {
    if (!UserMap.instance) {
      this.users = new Map();
      UserMap.instance = this;
    }
    return UserMap.instance;
  }

  updateMap(user) {
    this.users.set(user.id, user);
  }

  getById(id) {
    return this.users.get(id);
  }

  getByLogin(login) {
    for (const user of this.users.values()) {
      if (user.email === login) {
        return user;
      }
    }
    return null;
  }
}

const userMap = new UserMap();
Object.freeze(userMap);

module.exports = userMap;
