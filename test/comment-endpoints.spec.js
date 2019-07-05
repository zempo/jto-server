const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");

describe('Comment endpoints', () => {
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
    after("spacing", () => console.log('-------------------------------------\n'))
    // context(`Unauthorized user attempts to post a new comment`, () => {
    //   // add to protected routes protected routes 
    //   it("GET / responds with 200", () => {
    //     return supertest(app)
    //       .get("/")
    //       .expect(200);
    //   });
    // })

    context(`Authorized user posts a new comment`, () => {
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts));

      it("Creates a new comment, responding with 201 and the new comment", function () {
        // this.retries(2)
        const testCard = testCards[0];
        const testUser = testUsers[0];
        const newComment = { body: "Testing new comment", card_id: testCard.id }
        // console.log(helpers.seedCardsTables(db, testUsers, testCards, testComments, testReacts))
        console.log(helpers.makeAuthHeader(testUsers[0]))
        return supertest(app)
          .post("/api/comments")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(201)
          .expect((res) => {
            console.log(res.body)
            expect(res.body).to.have.property('id')
          })
      });
    })
  });

  describe(`PATCH, GET, DELETE for api/comments/comment_id`, () => {
    // beforeEach("insert things", () => helpers.seedCardsTables(db, testUsers, testUsers, testCards, testComments, testReacts));

    after("spacing", () => console.log('-------------------------------------\n'))
    it("GET / responds with 200", () => {
      return supertest(app)
        .get("/")
        .expect(200);
    });
  })


})