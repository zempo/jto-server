const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function () {
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

  describe(`GET user's private cards at /api/private/:user_id`, () => {
    context(`Given a user without private cards`, () => {
      // beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      // // still seeded 
      // // test user 4 and 2 don't have private cards
      // // REMEMBER! ARRAYS START AT ZERO! 
      // it(`Responds with 200 and an empty list`, () => {
      //   return supertest(app)
      //     .get("/api/private/2")
      //     .expect(200, []);
      // });
    });

    context(`Given a user has private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Responds with 200 and all public cards", () => {
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
          .get("/api/private/1")
          .expect(200, expectedCards);
      });
    });
  });
});
