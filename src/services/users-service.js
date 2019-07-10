const xss = require("xss");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");
// validator.validate(email) ==> outputs boolean

// setup
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  uniqueUserName(db, user_name) {
    return db("jto_users")
      .where({ user_name })
      .first()
      .then((user) => !!user);
  },
  uniqueEmail(db, email) {
    return db("thingful_users")
      .where({ email })
      .first()
      .then((user) => !!user);
  },
  validateEmail(email) {},
  validatePassword(password) {},
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      full_name: xss(user.full_name),
      user_name: xss(user.user_name),
      email: xss(user.email),
      date_created: new Date(user.date_created)
    };
  }
};

module.exports = UsersService;
