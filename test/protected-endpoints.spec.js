const app = require("../src/app");
const knex = require("knex");
const helpers = require("./test-helpers");

describe("Protected endpoints reject unathorized users.", () => {
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

  const protectedEndpoints = [
    {
      name: "GET /api/private/cards/:user_id",
      path: "/api/private/cards/:user_id",
      method: supertest(app).get
    },
    {
      name: "POST /api/private/cards/:user_id",
      path: "/api/private/cards/:user_id",
      method: supertest(app).post
    },
    {
      name: "GET /api/private/cards/:user_id/:card_id",
      path: "/api/private/cards/:user_id",
      method: supertest(app).get
    },
    {
      name: "DELETE /api/private/cards/:user_id/:card_id",
      path: "/api/private/cards/:user_id",
      method: supertest(app).delete
    },
    {
      name: "PATCH /api/private/cards/:user_id/:card_id",
      path: "/api/private/cards/:user_id",
      method: supertest(app).patch
    },
    {
      name: "PATCH /api/private/make-public/:user_id/:card_id",
      path: "/api/private/make-public/:user_id/:card_id",
      method: supertest(app).patch
    },
    {
      name: "PATCH /api/cards/make-public/:card_id",
      path: "/api/cards/make-public/:card_id",
      method: supertest(app).patch
    },
    {
      name: "POST /api/comments",
      path: "/api/comments",
      method: supertest(app).post
    },
    {
      name: "GET /api/comments/:comment_id",
      path: "/api/comments/:comment_id",
      method: supertest(app).get
    },
    {
      name: "DELETE /api/comments/:comment_id",
      path: "/api/comments/:comment_id",
      method: supertest(app).delete
    },
    {
      name: "PATCH /api/comments/:comment_id",
      path: "/api/comments/:comment_id",
      method: supertest(app).patch
    },
    {
      name: "GET /api/reactions/hearts/:card_id",
      path: "/api/reactions/hearts/:card_id",
      method: supertest(app).get
    },
    {
      name: "POST /api/reactions/hearts/:card_id",
      path: "/api/reactions/hearts/:card_id",
      method: supertest(app).post
    },
    {
      name: "PATCH /api/reactions/hearts/:card_id",
      path: "/api/reactions/hearts/:card_id",
      method: supertest(app).patch
    },
    {
      name: "GET /api/reactions/shares/:card_id",
      path: "/api/reactions/shares/:card_id",
      method: supertest(app).get
    },
    {
      name: "POST /api/reactions/shares/:card_id",
      path: "/api/reactions/shares/:card_id",
      method: supertest(app).post
    },
    {
      name: "PATCH /api/reactions/shares/:card_id",
      path: "/api/reactions/shares/:card_id",
      method: supertest(app).patch
    }
  ];

  protectedEndpoints.forEach((endpoint) => {
    describe(`${endpoint.name}`, () => {
      if (endpoint.path !== "/api/cards/make-public/:card_id") {
        it(`responds with 401: 'Missing Bearer Token', when no token`, () => {
          return endpoint.method(endpoint.path).expect(401, { error: "Missing Bearer Token" });
        });

        it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
          const validUser = testUsers[0];
          const invalidSecret = "bad-secret";
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: `Unauthorized Request` });
        });

        it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
          const invalidUser = { email: "user-not-existy", id: 1 };
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(invalidUser))
            .expect(401, { error: `Unauthorized Request` });
        });
      }
    });
  });
});
