const xss = require("xss");
const Treeize = require("treeize");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");
const swearjar = require("swearjar");
// validator.validate(email) ==> outputs boolean

// setup
const REGEX_ALPHA_NUM_UNDERSCORE = /(^[A-Za-z0-9\-\_]+$)/;
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;
const optimizeSwearjar = (str) => {
  let customList = process.env.SWEARS.split(" ");
  let customList2 = process.env.SWEARS2.split(" ");

  // Process string
  let comparisonStr = str
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[-_]/g, "")
    .replace(/[0]/g, "o")
    .replace(/[1]/g, "l")
    .replace(/[2]/g, "t")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "f")
    .replace(/[5]/g, "s")
    .replace(/[6]/g, "b")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b");

  let comparisonStr2 = str
    .toLowerCase()
    .replace(/\s/g, "")
    .replace(/[-_]/g, "")
    .replace(/[0]/g, "o")
    .replace(/[1]/g, "i")
    .replace(/[2]/g, "t")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "h")
    .replace(/[5]/g, "s")
    .replace(/[6]/g, "b")
    .replace(/[7]/g, "t")
    .replace(/[8]/g, "b");

  let result = customList.filter((swear) => {
    if (comparisonStr === swear || comparisonStr2 === swear) {
      return true;
    }
  });
  let result2 = customList2.filter((swear) => {
    if (comparisonStr.includes(swear) || comparisonStr2.includes(swear)) {
      return true;
    }
  });
  for (let key in swearjar._badWords) {
    if (
      (swearjar._badWords.hasOwnProperty(key) && (comparisonStr === key || comparisonStr2 === key)) ||
      result.length > 0 ||
      result2.length > 0
    ) {
      return true;
    }
  }
  return false;
};

const UsersService = {
  getUsers(db) {
    return db.select("*").from("jto_users");
  },
  getUserById(db, id) {
    return db
      .from("jto_users")
      .select("*")
      .where("id", id)
      .first();
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into("jto_users")
      .returning("*")
      .then(([user]) => {
        return user;
      });
  },
  deleteUser(db, id) {
    return db("jto_users")
      .where({ id })
      .delete();
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
  validateUserName(user_name) {
    if (!REGEX_ALPHA_NUM_UNDERSCORE.test(user_name)) {
      return "Username can only consist of alphanumeric characters, underscores, or hyphens.";
    }
    if (optimizeSwearjar(user_name)) {
      return "Username must not contain any profanity nor reference controversial figures.";
    }
    if (user_name.length < 3) {
      return "Username must be longer than 3 characters.";
    }
    if (user_name.length > 72) {
      return "Username must be less than 72 characters.";
    }
    if (user_name.startsWith(" ") || user_name.endsWith(" ")) {
      return "Username must not start or end with empty spaces";
    }
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
  validateFullName(name) {
    if (name.length > 150) {
      return "Full names shall be abbreviated to 150 characters based on Minnesota Statutory Law. Please reach out to our support team if you would like to create an account for the kitten who walks across your keyboard.";
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  serializeUsers(users) {
    return users.map(this.serializeUser);
  },
  serializeUser(user) {
    const userTree = new Treeize();

    const userData = userTree.grow([user]).getData()[0];

    return {
      admin: userData.admin,
      user_name: xss(userData.user_name),
      full_name: xss(userData.full_name),
      email: xss(userData.email),
      date_created: new Date(userData.date_created),
      date_modified: userData.date_modified || null
    };
  },
  serializeUsername(user) {
    const userTree = new Treeize();

    const userData = userTree.grow([user]).getData()[0];

    return {
      admin: userData.admin,
      user_name: xss(userData.user_name)
    };
  }
};

module.exports = UsersService;
