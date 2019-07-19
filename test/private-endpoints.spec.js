const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Endpoints for a user's private cards", function() {
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
    after("spacing", () => console.log("-------------------------------------\n"));
    context(`Given a user without private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with a 404 for a user with no private cards`, () => {
        let userToQuery = 2;

        return supertest(app)
          .get(`/api/private/cards/${userToQuery}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(404, { error: "This user has no private cards at the moment." });
      });
    });

    context(`Given a user has private cards`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 200 and all a given user's private cards`, () => {
        let userToQuery = 1;
        const expectedCards = testCards
          .filter((card, i, cards) => {
            if (card["public"] == false && card["user_id"] == userToQuery) {
              return true;
            } else {
              return false;
            }
          })
          .map((card) => {
            return helpers.makeExpectedPrivateCard(testUsers, card);
          });
        return supertest(app)
          .get(`/api/private/cards/${userToQuery}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedCards);
      });
    });
  });

  describe(`GET a single private card at /api/private/cards/:user_id/:card_id`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    context(`Given a user's private card has been moved or deleted`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with a 404 and error message.`, () => {
        let userToQuery = 1;
        let cardToQuery = 999999042;

        return supertest(app)
          .get(`/api/private/cards/${userToQuery}/${cardToQuery}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `This card is no longer private. It might have been deleted or made public.` });
      });
    });

    context(`Given a user's private card exists`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with a 200 and the card.`, () => {
        let userToQuery = 1;
        let cardToQuery = 3;
        const expectedCard = testCards
          .filter((card, i, cards) => {
            if (card["public"] == false && card["user_id"] == userToQuery && card["id"] == cardToQuery) {
              return true;
            } else {
              return false;
            }
          })
          .map((card) => {
            testUsers.forEach((user) => user.password);
            return helpers.makeExpectedPrivateCard(testUsers, card);
          });
        // console.log(expectedCard);
        return supertest(app)
          .get(`/api/private/cards/${userToQuery}/${cardToQuery}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedCard);
      });
    });
  });

  describe("POST /api/private/cards/:user_id", () => {
    context("Invalid or inappropriate fields in the request body", () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      it("Throws error when theme is missing", () => {
        const testUser = testUsers[0];
        const newCard = {
          front_message: "blah"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `Missing 'theme' in request body. Images are not required.` });
      });

      it("Throws error when front_message is missing", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `Missing 'front_message' in request body. Images are not required.` });
      });

      it("Throws error when inside_message is missing", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message: "Blah"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `Missing 'inside_message' in request body. Images are not required.` });
      });
    });
  });
});
