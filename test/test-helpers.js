const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
  return [
    {
      id: 1,
      admin: true,
      user_name: "test-user-1",
      full_name: "Test User One",
      password: "password",
      email: "test1@email.com",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null
    },
    {
      id: 2,
      admin: false,
      user_name: "test-user-2",
      full_name: "Test User Two",
      password: "password",
      email: "test2@email.com",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null
    },
    {
      id: 3,
      admin: false,
      user_name: "test-user-3",
      full_name: "Test User Three",
      password: "password",
      email: "test3@email.com",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null
    },
    {
      id: 4,
      admin: false,
      user_name: "test-user-4",
      full_name: "Test User Four",
      password: "password",
      email: "test4@email.com",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null
    }
  ];
}

function makeCardsArray(users) {
  return [
    {
      id: 1,
      theme: "cursive-plus",
      front_message: "Greeting 1",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: true,
      user_id: users[1].id
    },
    {
      id: 2,
      theme: "indie",
      front_message: "Greeting 2",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: true,
      user_id: users[2].id
    },
    {
      id: 3,
      theme: "cursive-plus",
      front_message: "Greeting 3",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: false,
      user_id: users[0].id
    },
    {
      id: 4,
      theme: "cursive-plus",
      front_message: "Greeting 4",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: false,
      user_id: users[0].id
    },
    {
      id: 5,
      theme: "cursive-plus",
      front_message: "Greeting 5",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: true,
      user_id: users[0].id
    },
    {
      id: 6,
      theme: "cursive-plus",
      front_message: "Greeting 6",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: true,
      user_id: users[3].id
    },
    {
      id: 7,
      theme: "kiddo",
      front_message: "Greeting 7",
      front_image: "https://loremflickr.com/g/500/400/flowers",
      inside_message:
        "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
      inside_image: "https://loremflickr.com/g/300/300/flowers",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      public: true,
      user_id: users[3].id
    }
  ];
}

function makeCommentsArray(users, cards) {
  return [
    {
      id: 1,
      body: "comment 1",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[0].id,
      card_id: cards[1].id
    },
    {
      id: 2,
      body: "comment 2",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[1].id,
      card_id: cards[1].id
    },
    {
      id: 3,
      body: "comment 3",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[3].id,
      card_id: cards[0].id
    },
    {
      id: 4,
      body: "comment 4",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[2].id,
      card_id: cards[4].id
    },
    {
      id: 5,
      body: "comment 5",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[2].id,
      card_id: cards[5].id
    },
    {
      id: 6,
      body: "comment 6",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[2].id,
      card_id: cards[2].id
    },
    {
      id: 7,
      body: "comment 7",
      date_created: "2029-01-22T16:28:32.615Z",
      date_modified: null,
      user_id: users[0].id,
      card_id: cards[3].id
    }
  ];
}

function makeReactsArray(users, cards) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      card_id: cards[1].id,
      react_heart: false,
      react_share: true
    },
    {
      id: 2,
      user_id: users[1].id,
      card_id: cards[1].id,
      react_heart: true,
      react_share: true
    },
    {
      id: 3,
      user_id: users[3].id,
      card_id: cards[0].id,
      react_heart: false,
      react_share: false
    },
    {
      id: 4,
      user_id: users[2].id,
      card_id: cards[4].id,
      react_heart: false,
      react_share: true
    },
    {
      id: 5,
      user_id: users[2].id,
      card_id: cards[5].id,
      react_heart: true,
      react_share: true
    },
    {
      id: 6,
      user_id: users[3].id,
      card_id: cards[2].id,
      react_heart: false,
      react_share: true
    },
    {
      id: 7,
      user_id: users[0].id,
      card_id: cards[3].id,
      react_heart: true,
      react_share: true
    }
  ];
}

function makeExpectedCard(users, card, comments = []) {
  const user = users.find((user) => user.id === card.user_id);

  const cardComments = comments.filter((comment) => comment.card_id === card.id);
  const number_of_comments = cardComments.length;

  return {
    id: card.id,
    theme: card.theme,
    front_message: card.front_message,
    front_image: card.front_image,
    inside_message: card.inside_message,
    inside_image: card.inside_image,
    date_created: card.date_created,
    date_modified: card.date_modified,
    public: card.public,
    user: {
      id: user.id,
      admin: user.admin,
      user_name: user.user_name,
      date_created: user.date_created
    },
    number_of_comments
  };
}

function makeExpectedPrivateCard(users, card) {
  const user = users.find((user) => user.id === card.user_id);
  return {
    id: card.id,
    theme: card.theme,
    front_message: card.front_message,
    front_image: card.front_image,
    inside_message: card.inside_message,
    inside_image: card.inside_image,
    date_created: card.date_created,
    date_modified: card.date_modified,
    public: card.public,
    user: {
      id: user.id,
      user_name: user.user_name,
      date_created: user.date_created
    }
  };
}

function makeExpectedComments(users, card_id, comments) {
  const expectedComments = comments.filter((comment) => comment.card_id === card_id);

  return expectedComments.map((comment) => {
    const commentUser = users.find((user) => user.id === comment.user_id);
    return {
      id: comment.id,
      body: comment.body,
      date_created: comment.date_created,
      date_modified: comment.date_modified,
      card_id: comment.card_id,
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        password: commentUser.password,
        email: commentUser.email,
        date_created: commentUser.date_created,
        date_modified: commentUser.date_modified
      }
    };
  });
}

function makeExpectedCardComments(card_id, comments) {
  const expectedComments = comments.filter((comment) => comment.card_id === card_id);

  return expectedComments.map((comment) => {
    return {
      id: comment.id,
      body: comment.body,
      date_created: comment.date_created,
      date_modified: comment.date_modified,
      card_id: comment.card_id,
      user_id: comment.user_id
    };
  });
}

function makeExpectedReactions(card, reacts = []) {
  const hearts = reacts.filter((reaction) => {
    // console.log(reaction)
    if (reaction.card_id === card.id && reaction.react_heart) {
      return true;
    }
  });
  const shares = reacts.filter((reaction) => {
    if (reaction.card_id === card.id && reaction.react_share) {
      return true;
    }
  });
  const number_of_hearts = hearts.length;
  const number_of_shares = shares.length;

  return {
    id: card.id,
    theme: card.theme,
    front_message: card.front_message,
    front_image: card.front_image,
    inside_message: card.inside_message,
    inside_image: card.inside_image,
    date_created: card.date_created,
    user_id: card.user_id,
    public: card.public,
    number_of_hearts,
    number_of_shares
  };
}

function makeJtoFixtures() {
  const testUsers = makeUsersArray();
  const testCards = makeCardsArray(testUsers);
  const testComments = makeCommentsArray(testUsers, testCards);
  const testReacts = makeReactsArray(testUsers, testCards);

  return { testUsers, testCards, testComments, testReacts };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
        jto_reacts,
        jto_comments,
        jto_cards,
        jto_users
        RESTART IDENTITY CASCADE`
  );
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 10)
  }));
  // console.log(preppedUsers);
  // .insert(preppedUsers) into the users db
  return db
    .into("jto_users")
    .insert(preppedUsers)
    .then(() => db.raw(`SELECT setVal('jto_users_id_seq', ?)`, [users[users.length - 1].id]));
}

function seedCardsTables(db, users, cards, comments = [], reacts = []) {
  return db
    .transaction(async (trx) => {
      await seedUsers(trx, users);
      await trx.into("jto_cards").insert(cards);
      await trx.raw(`SELECT setval('jto_cards_id_seq', ?)`, [cards[cards.length - 1].id]);
    })
    .then(() => comments.length && db.into("jto_comments").insert(comments))
    .then(() => reacts.length && db.into("jto_reacts").insert(reacts));
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    algorithm: "HS256"
  });
  // console.log(token)
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeCardsArray,
  makeExpectedCard,
  makeExpectedPrivateCard,
  makeExpectedComments,
  makeExpectedCardComments,
  makeExpectedReactions,
  makeCommentsArray,
  makeReactsArray,
  makeJtoFixtures,
  cleanTables,
  seedUsers,
  seedCardsTables,
  makeAuthHeader
};
