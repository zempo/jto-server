const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Endpoints for a user's own cards", function () {
  let db;

  const { testUsers, testCards, testComments, testReacts } = helpers.makeJtoFixtures();

  before("Instantiate knex", () => {
    db = knex({
      client: "pg",
      connection: process.env.DB_TESTING_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  // beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

  describe(`GET user's private cards at /api/private/cards/:user_id`, () => {
    context(`Given a user without private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 200 and an empty list for a user with no private cards`, () => {
        let userToQuery = 2
        const expectedCards = testCards.filter((card, i, cards) => {
          // console.log(userToQuery)
          if (card["public"] == false && card["user_id"] == userToQuery) {
            return true
          } else {
            return false
          }
        }).map(card => {
          // console.log(helpers.makeExpectedPrivateCard(testUsers, card));
          return helpers.makeExpectedPrivateCard(testUsers, card);
        });
        // console.log(expectedCards);
        return supertest(app)
          .get(`/api/private/cards/${userToQuery}`)
          .expect(200, []);
      });
    });

    context(`Given a user has private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 200 and all a given user's private cards`, () => {
        let userToQuery = 1
        const expectedCards = testCards.filter((card, i, cards) => {
          // console.log(userToQuery)
          if (card["public"] == false && card["user_id"] == userToQuery) {
            return true
          } else {
            return false
          }
        }).map(card => {
          // console.log(helpers.makeExpectedPrivateCard(testUsers, card));
          return helpers.makeExpectedPrivateCard(testUsers, card);
        });
        // console.log(expectedCards);
        return supertest(app)
          .get(`/api/private/cards/${userToQuery}`)
          .expect(200, expectedCards);
      });
    });
  });

  describe(`GET a single private card at /api/private/cards/:user_id/:card_id`, () => {
    context(`Given a user's private card has been moved or deleted`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with a 404 and error message.`, () => {
        let userToQuery = 1
        let cardToQuery = 999999042
        const expectedCard = testCards.filter((card, i, cards) => {
          // console.log(userToQuery)
          if (card["public"] == false && card["user_id"] == userToQuery && card["id"] == cardToQuery) {
            return true
          } else {
            return false
          }
        }).map(card => {
          // console.log(helpers.makeExpectedPrivateCard(testUsers, card));
          return helpers.makeExpectedPrivateCard(testUsers, card);
        });
        // console.log(expectedCard);
        return supertest(app)
          .get(`/api/private/cards/${userToQuery}/${cardToQuery}`)
          .expect(404, { error: `This card is no longer private. It might have been deleted or made public.` });
      })
    })
  })

});
