const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Cards endpoints", function() {
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

  describe(`GET public cards at /api/cards`, () => {
    context(`Given no public cards`, () => {
      it(`Responds with 200 and an empty list`, () => {
        return supertest(app)
          .get("/api/cards")
          .expect(200, []);
      });
    });

    context(`Given existing public cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Responds with 200 and all public cards", () => {
        const expectedCards = testCards.map((card, i, cards) => {
          console.log(card["public"]);
          if (card["public"] == true) {
            return helpers.makeExpectedCard(testUsers, card, testComments, testReacts);
          } else {
            return false;
          }
        });
        // console.log(expectedCards);
        return supertest(app)
          .get("/api/cards")
          .expect(200, expectedCards);
      });
    });
  });
});
