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

  beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

  describe(`GET user's private cards at /api/private/:user_id`, () => {
    context(`Given a user without private cards`, () => {
      // test user 4 and 2 don't have private cards
      // REMEMBER! ARRAYS START AT ZERO! 
      it(`Responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/private/1")
          .expect(200, []);
      });
    });

    context(`Given a user has private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Responds with 200 and all public cards", () => {
        const expectedCards = testCards.filter((card, i, cards) => {
          // console.log(card["public"]);
          // first filter to simulate a query
          // then map through
          // otherwise you'll return 
          // undefined at the array indexes that don't
          // meet the query criteria.
          if (card["public"] == true) {
            return true
          } else {
            return false
          }
        }).map(card => {
          return helpers.makeExpectedCard(testUsers, card, testComments);
        });
        // console.log(expectedCards);
        return supertest(app)
          .get("/api/cards")
          .expect(200, expectedCards);
      });
    });
  });
});
