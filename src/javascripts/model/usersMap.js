'use strict';
const {loggers} = require('winston')
const logger = loggers.get('appLogger');
const fs = require('fs');
const User = require('./users');

const userFile = "./config/user.json"

class UserMap {
  constructor() {
    if (!UserMap.instance) {
      logger.debug("initialize user map");
      this.users = new Map();
      UserMap.instance = this;
      this.restoreUserFromFile();
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

  restoreUserFromFile() {
    if (fs.existsSync(userFile)) {
      const userArray = JSON.parse(fs.readFileSync(userFile));
      for (const user of userArray.values()) {
        this.updateMap(User.fromJSON(user))
      }
      logger.debug("Users loaded: " + this.users.size);
    } else {
      logger.debug("file not found: " + userFile);
    }
  }

  storeUserToFile() {
    const userArray = new Array();
    for (const user of this.users.values()) {
      userArray.push(user)
    }
    fs.writeFileSync(userFile, JSON.stringify(userArray, null, 4));
  }

  getNextId() {
    let id = 0;
    for (const user of this.users.values()) {
      id = Math.max((id, user.id));
    }
    return id+1;
  }
}

const userMap = new UserMap();
Object.freeze(userMap);

module.exports = userMap;
