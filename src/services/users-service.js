const xss = require("xss");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");
// validator.validate(email) ==> outputs boolean

// setup
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("jto_users")
      .returning("*")
      .then(([user]) => user);
  },
  uniqueUserName(db, user_name) {
    return db("jto_users")
      .where({ user_name })
      .first()
      .then((user) => {
        return !!user;
      });
  },
  uniqueEmail(db, email) {
    return db("jto_users")
      .where({ email })
      .first()
      .then((user) => {
        return !!user;
      });
  },
  checkAllFields(user) {
    for (const [key, value] of Object.entries(user)) {
      if (value == null) {
        return `Missing required '${key}' to create new user`;
      }
    }
    // if loops through and finds all keys
    return null;
  },
  validateEmail(email) {
    if (validator.validate(email) == false) {
      return "Invalid email";
    }
    return null;
  },
  validatePassword(password) {
    if (password.length < 8) {
      return "Password must be longer than 8 characters";
    }
    if (password.length > 72) {
      return "Password must be less than 72 characters";
    }
    if (password.startsWith(" ") || password.endsWith(" ")) {
      return "Password must not start or end with empty spaces";
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return "Password must contain 1 upper case, lower case, number and special character";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUser(user) {
    return {
      id: user.id,
      user_name: xss(user.user_name),
      full_name: xss(user.full_name),
      email: xss(user.email),
      date_created: new Date(user.date_created)
    };
  }
};

module.exports = UsersService;
