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

    context(`Given a user has private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Responds with 200 and all public cards", () => {
        const expectedCards = testCards.filter((card, i, cards) => {
          if (card["public"] == true) {
            return true
          } else {
            return false
          }
        }).map(card => {
          return helpers.makeExpectedReactions(card, testReacts, 1);
        });
        // console.log(expectedCards);
        return supertest(app)
          .get("/api/reactions")
          .expect(200, expectedCards);
      });
    });
  });
});
