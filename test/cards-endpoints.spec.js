const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Cards endpoints", function () {
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

      it(`Responds with 200 and all public cards`, () => {
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

  describe(`GET a public card at api/card/:card_id`, () => {
    context(`Given a public card doesn't exist or isn't public`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 404 because it doesn't exist`, () => {
        let card_id = 999999042
        return supertest(app)
          .get(`/api/cards/${card_id}`)
          .expect(404, { error: `This public card no longer exists. It might have been deleted or made private.` })
      })

      it(`Responds with 404 because it isn't public`, () => {
        let card_id = 4
        return supertest(app)
          .get(`/api/cards/${card_id}`)
          .expect(404, { error: `This public card no longer exists. It might have been deleted or made private.` })
      })

    })

    context(`Given a public card that exists`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 200 and card`, () => {
        let card_id = 1
        const expectedCard = helpers.makeExpectedCard(testUsers, testCards[card_id - 1], testComments)
        return supertest(app)
          .get(`/api/cards/${card_id}`)
          .expect(200, expectedCard)
      })
    })

  })

});
