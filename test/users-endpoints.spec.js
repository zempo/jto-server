const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("User endpoints", () => {
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

  describe(`GET /api/users/`, () => {
    // at least 1 user must be in database, as this is a protected endpoint
    context("Users in database", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      it(`returns with 200 and all users`, () => {
        // can only be admin!!
        let requestingUser = testUsers[0];
        return supertest(app)
          .get(`/api/users`)
          .set("Authorization", helpers.makeAuthHeader(requestingUser))
          .expect(200)
          .expect((res) => {
            expect(res.body).to.be.an("array");
            expect(res.body[0]).to.not.have.property("id");
            expect(res.body[0]).to.not.have.property("admin");
            expect(res.body[0]).to.have.property("user_name");
            expect(res.body[0]).to.have.property("full_name");
            expect(res.body[0]).to.have.property("email");
            expect(res.body[0]).to.have.property("date_created");
          });
      });
    });
  });

  describe(`GET /api/users/:user_id`, () => {
    context("user exists and requester is also user", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      it(`returns with 200 and the requesting user's own account`, () => {
        let requestingUser = testUsers[1];
        return supertest(app)
          .get(`/api/users/${requestingUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(requestingUser))
          .expect(200)
          .expect((res) => {
            expect(res.body).to.be.an("object");
            expect(res.body).to.not.have.property("id");
            expect(res.body).to.not.have.property("admin");
            expect(res.body).to.have.property("user_name");
            expect(res.body).to.have.property("full_name");
            expect(res.body).to.have.property("email");
            expect(res.body).to.have.property("date_created");
            expect(res.body.user_name).to.eql(requestingUser.user_name);
            expect(res.body.full_name).to.eql(requestingUser.full_name);
            expect(res.body.email).to.eql(requestingUser.email);
            expect(res.body.date_created).to.eql(requestingUser.date_created);
          });
      });
    });
  });

  describe(`POST /api/users/`, () => {
    context("Incomplete user registration", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));
      const incompleteFields = [
        {
          user_name: "mike",
          email: "mickey@gmail.com"
        },
        {
          password: "passwordF3@"
        },
        {
          user_name: "mike",
          password: "passwordF3@"
        },
        {
          user_name: "mike",
          full_name: "mike wazowski",
          password: "passwordF3@"
        }
      ];
      incompleteFields.forEach((request) => {
        it("Throws error when missing key fields", () => {
          return supertest(app)
            .post(`/api/users`)
            .send(request)
            .expect(400)
            .expect((res) => {
              console.log(res.body);
              expect(res.body).to.have.property("error");
            });
        });
      });
    });

    context("Invalid user registration", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      const invalidFields = [
        {
          user_name: "test-user-1",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "Validpwd45!"
        },
        {
          user_name: "valid-test-user",
          full_name: "Invalory Profane",
          email: "test1@email.com",
          password: "Validpwd45!"
        },
        {
          user_name: "  spacey-test-user",
          full_name: "Invalory Profane",
          email: "test1@email.com",
          password: "Validpwd45!"
        },
        {
          user_name: "ass",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "Validpwd45!"
        },
        {
          user_name: "@#$%#-the-first",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "Validpwd45!"
        },
        {
          user_name: "q",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "invalidpassword"
        },
        {
          user_name: "invalidinvalidinvalidinvalidinvalidinvalidinvalidkjsddpoijkopjpokpokpokopkpokopkpokpokpok",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "invalidpassword"
        },
        {
          user_name: "valid",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "Pwd45!"
        },
        {
          user_name: "valid",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password:
            "invalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpasswordinvalidpassword"
        },
        {
          user_name: "valid-user",
          full_name: "Invalory Profane",
          email: "not@mailletmeloginalready@",
          password: "Validpwd45!"
        }
      ];

      invalidFields.forEach((request) => {
        it("Throws error when invalid req", () => {
          return supertest(app)
            .post(`/api/users`)
            .send(request)
            .expect(400)
            .expect((res) => {
              console.log(res.body);
              expect(res.body).to.have.property("error");
            });
        });
      });
    });

    context("Valid and complete user registration", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      const validFields = [
        {
          user_name: "valid-user",
          full_name: "Invalory Profane",
          email: "validemail@gmail.com",
          password: "Validpwd45!"
        }
      ];

      validFields.forEach((request) => {
        it("creates new user", () => {
          return supertest(app)
            .post(`/api/users`)
            .send(request)
            .expect(201)
            .expect((res) => {
              console.log(res.body);
              //   expect(res.body).to.have.property("error");
              expect(res.body).to.be.an("object");
              expect(res.body).to.not.have.property("id");
              expect(res.body).to.not.have.property("admin");
              expect(res.body).to.have.property("user_name");
              expect(res.body).to.have.property("full_name");
              expect(res.body).to.have.property("email");
              expect(res.body).to.have.property("date_created");
              expect(res.body.user_name).to.eql(request.user_name);
              expect(res.body.full_name).to.eql(request.full_name);
              expect(res.body.email).to.eql(request.email);
            });
        });
      });
    });
  });

  describe(`DELETE /api/users/:user_id`, () => {
    context("user exists and requester is also user", () => {
      after("spacing", () => console.log("-------------------------------------\n"));
      beforeEach("insert cards", () => helpers.seedCardsTables2(db, testUsers, testCards, testComments, testReacts));

      it(`returns with 204 and lets user delete their own account`, () => {
        let requestingUser = testUsers[1];
        return supertest(app)
          .delete(`/api/users/${requestingUser.id}`)
          .set("Authorization", helpers.makeAuthHeader(requestingUser))
          .expect(204);
      });
    });
  });
});
