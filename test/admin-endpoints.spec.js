const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("ADMIN-authorized endpoints", () => {
  let db;

  const { testUsers, testCards, testComments, testReacts } = helpers.makeJtoFixtures();

  before("Instantiate knex", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

  describe(`GET endpoints`, () => {
    const ADMIN_GETS = [
      {
        name: "GET /api/comments/:comment_id",
        path: "/api/comments/6",
        method: supertest(app).get
      },
      {
        name: "GET /api/users/",
        path: "/api/users",
        method: supertest(app).get
      },
      {
        name: "GET /api/users/:user_id",
        path: "/api/users/3",
        method: supertest(app).get
      }
    ];

    ADMIN_GETS.forEach((endpoint) => {
      context(`${endpoint.name}`, () => {
        it(`Works for admin`, () => {
          let adminUser = testUsers[0];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(adminUser))
            .expect(200);
          // .expect((res) => {
          //   console.log(res.body);
          // });
        });

        it(`Doesn't work for non-admin`, () => {
          let regularUser = testUsers[4];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(regularUser))
            .expect(403);
        });
      });
    });
  });

  describe(`DELETE endpoints`, () => {
    const ADMIN_DELETES = [
      {
        name: "DELETE /api/cards/:card_id",
        path: "/api/cards/1",
        method: supertest(app).delete
      },
      {
        name: "DELETE /api/comments/:comment_id",
        path: "/api/comments/6",
        method: supertest(app).delete
      },
      {
        name: "DELETE /api/users/:user_id",
        path: "/api/users/2",
        method: supertest(app).delete
      }
    ];

    ADMIN_DELETES.forEach((endpoint) => {
      context(`${endpoint.name}`, () => {
        it(`Works for admin`, () => {
          let adminUser = testUsers[0];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(adminUser))
            .expect(204);
        });

        it(`Doesn't work for non-admin`, () => {
          let regularUser = testUsers[4];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(regularUser))
            .expect(403);
        });
      });
    });
  });
  describe(`PATCH endpoints`, () => {
    const ADMIN_PATCHES = [
      {
        name: "PATCH /api/comments/:comment_id",
        path: "/api/comments/6",
        method: supertest(app).patch,
        payload: {
          body: "Patched by admin!"
        }
      }
    ];

    ADMIN_PATCHES.forEach((endpoint) => {
      context(`${endpoint.name}`, () => {
        it(`Works for admin`, () => {
          let adminUser = testUsers[0];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(adminUser))
            .send(endpoint.payload)
            .expect(204);
        });

        it(`Doesn't work for non-admin`, () => {
          let regularUser = testUsers[4];
          return endpoint
            .method(endpoint.path)
            .set("Authorization", helpers.makeAuthHeader(regularUser))
            .send(endpoint.payload)
            .expect(403);
        });
      });
    });
  });
});
