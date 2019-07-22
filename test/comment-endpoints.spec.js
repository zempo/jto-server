const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Comment endpoints", () => {
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

  describe(`POST a comment to /api/comments/`, () => {
    context(`Authorized user posts a new comment`, () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      it("Creates a new comment, responding with 201 and the new comment", function() {
        this.retries(3);
        const testCard = testCards[0];
        const testUser = testUsers[0];
        const newComment = { body: "Testing new comment", card_id: testCard.id };

        return supertest(app)
          .post("/api/comments")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(201)
          .expect((res) => {
            expect(res.body).to.have.property("id");
            expect(res.body).to.have.property("user");
            expect(res.body.body).to.eql(newComment.body);
            expect(res.body.user.id).to.eql(testUser.id);
            expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`);
            const expectedDate = new Date().toLocaleString("en", { timeZone: "America/Los_Angeles" });
            const actualDate = new Date(res.body.date_created).toLocaleString();
            expect(actualDate).to.eql(expectedDate);
          });
      });
    });

    context(`Authorized user posts a profane comment`, () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards));

      it("Creates a new comment, responding with 201 and the censored body", function() {
        this.retries(3);
        const testCard = testCards[0];
        const testUser = testUsers[0];
        const newComment = { body: "Testing hell comment", card_id: testCard.id };

        return supertest(app)
          .post("/api/comments")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(201)
          .expect((res) => {
            expect(res.body.body).to.eql("Testing **** comment");
          });
      });
    });
  });

  describe(`GET api/comments/comment_id`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    beforeEach("insert things", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

    context("Given a comment does not exist", () => {
      after("spacing", () => console.log("\n"));
      it("It responds with 404", () => {
        const commentToGet = 200000000;
        return supertest(app)
          .get(`/api/comments/${commentToGet}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: "This comment no longer exists." });
      });
    });

    context("Given a comment exists", () => {
      after("spacing", () => console.log("\n"));
      it("Responds with 403 for invalid/nonadmin user", () => {
        const commentToGet = 2;

        return supertest(app)
          .get(`/api/comments/${commentToGet}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[2]))
          .expect(403);
      });

      it("Responds with 200 for valid user", () => {
        const commentToGet = 2;
        const expectedComment = helpers.makeExpectedComments(testUsers, commentToGet, testComments)[0];

        return supertest(app)
          .get(`/api/comments/${commentToGet}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(200, expectedComment);
      });
    });
  });

  describe(`PATCH api/comments/comment_id`, () => {
    after("spacing", () => console.log("-------------------------------------\n"));
    beforeEach("insert things", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

    context("Given a comment does not exist", () => {
      const commentToGet = 20100400010012;
      return supertest(app)
        .patch(`/api/comments/${commentToGet}`)
        .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
        .expect(404);
    });

    context("Given an invalid patch", () => {
      it("Responds with 403 for invalid/nonadmin user", () => {
        const commentToPatch = 2;
        const patchedBody = {
          body: "patched"
        };

        return supertest(app)
          .patch(`/api/comments/${commentToPatch}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[2]))
          .send(patchedBody)
          .expect(403, { error: "User does not match card" });
      });

      it("Responds with 404 for insufficient fields updated", () => {
        const commentToPatch = 2;
        const patchedBody = {};

        return supertest(app)
          .patch(`/api/comments/${commentToPatch}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .send(patchedBody)
          .expect(400, { error: "Missing required 'body' to create new comment" });
      });
    });

    context("Given a complete patch", () => {
      after("spacing", () => console.log("\n"));
      it("Responds with 204 for valid user", () => {
        const commentToPatch = 2;
        const patchedBody = {
          body: "patched"
        };

        return supertest(app)
          .patch(`/api/comments/${commentToPatch}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .send(patchedBody)
          .expect(204);
      });
    });
  });

  describe(`DELETE for api/comments/comment_id`, () => {
    beforeEach("insert things", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));
    after("spacing", () => console.log("-------------------------------------\n"));

    context("Given the article exists", () => {
      after("spacing", () => console.log("\n"));
      const commentToDelete = 4;
      it("Responds with 403 and for invalid/nonadmin user", () => {
        return supertest(app)
          .delete(`/api/comments/${commentToDelete}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[1]))
          .expect(403);
      });

      it("Responds with 204 and deletes given content for valid/admin user", () => {
        return supertest(app)
          .delete(`/api/comments/${commentToDelete}`)
          .set("Authorization", helpers.makeAuthHeader(testUsers[2]))
          .expect(204);
      });
    });
  });
});
