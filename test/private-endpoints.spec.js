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
      after("spacer", () => console.log("\n"));
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
      after("spacer", () => console.log("\n"));
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
      after("spacer", () => console.log("\n"));
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
      after("spacer", () => console.log("\n"));
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
    after("spacing", () => console.log("-------------------------------------\n"));
    context("Given Invalid Request Body", () => {
      after("spacer", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      it("Throws error when theme is missing", () => {
        const testUser = testUsers[0];
        const newCard = {};

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `Missing 'theme' in request body. Images are not required.` });
      });

      it("Throws error when theme is invalid", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "I am Iron Man"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `Invalid theme supplied.` });
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

      it("Throws error when front_message exceeds 100 characters", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message:
            "Blah blah blah it takes a lot of time to get to 100 characters. Did you know about this? Gosh, I'm nearly bored to tears. Ooop, here I am. Finally!",
          inside_message: "What he said..."
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, {
            error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
          });
      });

      it("Throws error when inside_message exceeds 650 characters", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message: "What he said...",
          inside_message:
            "lorem is ipsum. Some ipsum. Most ipsum. lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum.lorem is ipsum. Some ipsum. Most ipsum."
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, {
            error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
          });
      });

      it("If used, the front image must be a valid url", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message: "Blah",
          inside_message: "Blah two",
          front_image: "blah three!"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `If used, card images must be valid URL` });
      });

      it("If used, the inside_image must be valid url", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message: "Blah",
          inside_message: "Blah two",
          inside_image: "blah three!"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(400, { error: `If used, card images must be valid URL` });
      });
    });

    context("Malicious content in request body", () => {
      after("spacer", () => console.log("\n"));

      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      // to do: add xss test
      it("Removes XSS attack content", () => {
        const testUser = testUsers[0];
        const { maliciousCard, expectedCard } = helpers.makeMaliciousCard(testUser);
        const newMaliciousCard = {
          theme: maliciousCard.theme,
          front_message: maliciousCard.front_message,
          inside_message: maliciousCard.inside_message
        };
        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newMaliciousCard)
          .expect(201)
          .then((res) => {
            expect(res.body.front_message).to.eql(expectedCard.front_message);
            expect(res.body.inside_message).to.eql(expectedCard.inside_message);
          });
      });
    });

    context("Inappropriate content in the request body.", () => {
      after("spacer", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      it("Creates new card with profane words removed and detected", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "kiddo",
          front_message: "hell butt one",
          inside_message: "hell butt two"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(201)
          .expect((res) => {
            expect(res.body.front_message).to.eql("**** **** one");
            expect(res.body.inside_message).to.eql("**** **** two");
          });
      });
    });

    context("Appropriate and complete request", () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Creates a new card", () => {
        const testUser = testUsers[0];
        const newCard = {
          theme: "handwritten",
          front_message: "Happy New Greeting!",
          inside_message: "May all your unit tests pass!",
          inside_image: "https://picsum.photos/200/300",
          front_image: "https://picsum.photos/200/300"
        };

        return supertest(app)
          .post(`/api/private/cards/${testUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newCard)
          .expect(201)
          .expect((res) => {
            expect(res.headers.location).to.eql(`/api/private/cards/${testUser.id}/${res.body.id}`);
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("public");
            expect(res.body.public).to.be.a("boolean");
            expect(res.body.front_message).to.eql(newCard.front_message);
            expect(res.body.front_image).to.eql(newCard.front_image);
            expect(res.body.inside_message).to.eql(newCard.inside_message);
            expect(res.body.inside_image).to.eql(newCard.inside_image);
            expect(res.body.user).to.be.an("object");
            expect(res.body.user).to.include({ id: testUser.id });
            expect(res.body.user).to.include({ user_name: testUser.user_name });
            expect(res.body.user).to.include({ date_created: testUser.date_created });

            const expectedDate = new Date().toLocaleString("en", { timeZone: "America/Los_Angeles" });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            // when testing for time, test only this context
            // previous tests take approximately 1 minute to run on most machines
            // this.retries() is insufficient

            // expect(actualDate).to.eql(expectedDate);
          });
      });
    });
  });

  describe("DELETE /api/private/cards/:user_id/:card_id", () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    context("Given card not private, but exists", () => {
      after("spacing", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Responds with 404", () => {
        const testUser = testUsers[0];
        const testCard = testCards[1];
        return supertest(app)
          .delete(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: "This card is no longer private. It might have been deleted or made public." });
      });
    });

    context("Given card is private", () => {
      after("spacing", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it(`Responds with 403 for invalid user`, () => {
        const testUser = testUsers[2];
        const hackerMan = testUsers[3];
        const testCard = testCards[7];
        return supertest(app)
          .delete(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(hackerMan))
          .expect(403);
      });

      it(`Responds with 204 when card belongs to user`, () => {
        const testUser = testUsers[2];
        const testCard = testCards[7];
        return supertest(app)
          .delete(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[2]))
          .expect(204);
      });
    });
  });

  describe("PATCH /api/private/cards/:user_id/:card_id", () => {
    context("Given Invalid Request Body", () => {
      after("spacer", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      it("Returns 400 error when request is empty", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {};

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, {
            error: `Request body must include either theme, front_message, front_image, inside_message, or inside_image`
          });
      });

      it("Returns 400 error when theme is invalid", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {
          theme: "comic sans"
        };

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, { error: `Invalid theme supplied.` });
      });

      it("Returns 400 error when front message is too long", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {
          theme: "cursive-plus",
          front_message:
            "too long too long too long is ipsum exceeding 100 characters takes less than one would imagine. Here we go here we go here we go",
          inside_message:
            "haha! I can be 100 characcters. Not too long too long too long is ipsum exceeding 100 characters takes less than one would imagine. Here we go here we go here we go"
        };

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, {
            error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
          });
      });

      it("Returns 400 error when inside message is too long", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {
          theme: "cursive-plus",
          inside_message:
            "too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go too long too long too long is ipsum exceeding 650 characters takes less than one would imagine. Here we go here we go here we go"
        };

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, {
            error: `Front Message cannot exceed 100 characters in length. Inside message cannot exceed 650 characters.`
          });
      });

      it("Returns 400 error when front image is invalid url", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {
          front_image: "some invalid url"
        };

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, { error: `If used, card images must be valid URL` });
      });

      it("Returns 400 error when inside image is invalid url", () => {
        const testUser = testUsers[0];
        const testCard = testCards[2];
        const updatedCard = {
          front_image: "some invalid url"
        };

        return supertest(app)
          .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(updatedCard)
          .expect(400, { error: `If used, card images must be valid URL` });
      });
    });

    context("Given valid request body", () => {
      after("spacer", () => console.log("\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));
      const validEntries = [
        {
          theme: "kiddo"
        },
        {
          front_message: "Less than 100 characters"
        },
        {
          front_image: "https://picsum.photos/200/300"
        },
        {
          inside_message: "Less than 650 characters"
        },
        {
          inside_image: "https://picsum.photos/200/300"
        }
      ];

      validEntries.forEach((entry) => {
        it(`Updates ${Object.keys(entry)[0]}`, () => {
          const testUser = testUsers[0];
          const testCard = testCards[2];

          return supertest(app)
            .patch(`/api/private/cards/${testUser.id}/${testCard.id}`)
            .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
            .send(entry)
            .expect(204);
        });
      });
    });
  });
});
