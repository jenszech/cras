const crypto = require('crypto');
const jwt = require('jsonwebtoken');

class User {
  constructor(id, email) {
    this.id = id;
    this.email = email;
    this.hash = '';
    this.salt = '';
    this.token = '';
    this.token_expire = 0;
  }

  setPassword(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  }

  validatePassword(password) {
    const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
    return this.hash === hash;
  }

  generateJWT() {
    const today = new Date();
    this.token_expire = new Date(today);
    this.token_expire.setDate(today.getDate() + 60);

    this.token = jwt.sign(
      {
        email: this.email,
        id: this.id,
        exp: parseInt(this.token_expire.getTime() / 1000, 10),
      },
      'secret',
    );
    return this.token;
  }

  toAuthJSON() {
    return {
      _id: this.id,
      email: this.email,
      token: this.token,
      expire: this.token_expire,
    };
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      salt: this.salt,
      hash: this.hash
    };
  }
  toIdJSON(){
    return {
      id: this.id,
      email: this.email,
    };
  }


  static fromJSON(user) {
    const newUser = new User(user.id, user.email);
    newUser.salt = user.salt;
    newUser.hash = user.hash;
    return newUser;
  }

}
module.exports = User;
