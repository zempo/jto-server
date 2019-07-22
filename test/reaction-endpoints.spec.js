const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Protected endpoints", function() {
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

  describe(`GET all reaction counts /api/reactions/`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    context(`Given there are public cards`, () => {
      after("spacing", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Returns accurate card reaction counts for all cards", () => {
        const expectedCards = testCards
          .filter((card, i, cards) => {
            if (card["public"] == true) {
              return true;
            } else {
              return false;
            }
          })
          .map((card) => {
            return helpers.makeExpectedReactions(card, testReacts);
          });
        // console.log(expectedCards);
        return supertest(app)
          .get("/api/reactions")
          .expect(200, expectedCards);
      });
    });
  });

  describe(`GET the reactions of a single card`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    context(`Given a public card doesn't exist or isn't public`, () => {
      after("spacing", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 404 because it doesn't exist`, () => {
        let card_id = 999999042;
        return supertest(app)
          .get(`/api/reactions/${card_id}`)
          .expect(404, { error: `This public card no longer exists. It might have been deleted or made private.` });
      });

      it(`Responds with 404 because it isn't public`, () => {
        let card_id = 4;
        return supertest(app)
          .get(`/api/reactions/${card_id}`)
          .expect(404, { error: `This public card no longer exists. It might have been deleted or made private.` });
      });
    });

    context(`Given a public card that exists`, () => {
      after("spacing", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 200 and card`, () => {
        let card_id = 1;
        const expectedCard = helpers.makeExpectedReactions(testCards[card_id - 1], testReacts);
        return supertest(app)
          .get(`/api/reactions/${card_id}`)
          .expect(200, expectedCard);
      });
    });
  });

  describe(`GET /api/reactions/hearts/:card_id and /api/reactions/shares/:card_id by current user`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));
    context(`Given a user hasn't reacted to the card or card does not exist`, () => {
      after("spacing", () => console.log("\n"));
      it("returns 200 and empty array for hearts", () => {
        let card_id = 4;
        return supertest(app)
          .get(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, []);
      });

      it("returns 200 and empty array for shares", () => {
        let card_id = 4;
        return supertest(app)
          .get(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, []);
      });
    });

    context(`Given user has posted a reaction`, () => {
      after("spacing", () => console.log("\n"));
      it("returns 200 and expected reaction", () => {
        let card_id = 2;
        let testUser = testUsers[1];
        let expectedReaction = helpers.makeExpectedReactionsByUser(card_id, testUser.id, testReacts);

        return supertest(app)
          .get(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedReaction);
      });

      it("returns 200 and expected reaction", () => {
        let card_id = 2;
        let testUser = testUsers[1];
        let expectedReaction = helpers.makeExpectedReactionsByUser(card_id, testUser.id, testReacts);

        return supertest(app)
          .get(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedReaction);
      });
    });
  });

  describe(`POST new reaction through /api/reactions/hearts/:card_id and /api/reactions/shares/:card_id by current user`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

    context(`Given user posts new reaction`, () => {
      after("spacing", () => console.log("\n"));
      it("returns 200 and expected heart", () => {
        let card_id = 4;
        let testUser = testUsers[1];
        let expectedReaction = helpers.makeExpectedReactionsByUser(card_id, testUser.id, testReacts);

        return supertest(app)
          .post(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(201)
          .expect((res) => {
            // expect([{a: 1}]).to.not.include({a: 1});
            expect(testReacts).to.not.include(res.body[0]);
            expect(res.body[0].card_id).to.eql(card_id);
            expect(res.body[0].user_id).to.eql(testUser.id);
            expect(res.body[0].react_heart).to.eql(true);
            expect(res.body[0].react_share).to.eql(false);
          });
      });

      it("returns 200 and expected share", () => {
        let card_id = 4;
        let testUser = testUsers[1];
        let expectedReaction = helpers.makeExpectedReactionsByUser(card_id, testUser.id, testReacts);

        return supertest(app)
          .post(`/api/reactions/shares/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(201)
          .expect((res) => {
            // expect([{a: 1}]).to.not.include({a: 1});
            expect(testReacts).to.not.include(res.body[0]);
            expect(res.body[0].card_id).to.eql(card_id);
            expect(res.body[0].user_id).to.eql(testUser.id);
            expect(res.body[0].react_heart).to.eql(false);
            expect(res.body[0].react_share).to.eql(true);
          });
      });
    });
  });

  describe.only(`PATCH to toggle current reaction through /api/reactions/hearts/:card_id and /api/reactions/shares/:card_id by current user`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

    context(`Given user has not posted reaction`, () => {
      it("Toggles heart to opposite", () => {
        let card_id = 4;
        let testUser = testUsers[1];

        return supertest(app)
          .patch(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(204);
      });

      it("Toggles share to true", () => {
        let card_id = 4;
        let testUser = testUsers[1];

        return supertest(app)
          .patch(`/api/reactions/shares/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(204);
      });
    });

    context(`Given user has posted reaction`, () => {
      it("Toggles heart to opposite", () => {
        let card_id = 2;
        let testUser = testUsers[1];

        return supertest(app)
          .patch(`/api/reactions/hearts/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(204);
      });

      it("Toggles share to true", () => {
        let card_id = 2;
        let testUser = testUsers[1];

        return supertest(app)
          .patch(`/api/reactions/shares/${card_id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(204);
      });
    });
  });
});
