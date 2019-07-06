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

    context(`Authorized user posts a new comment`, () => {
      after("spacing", () => console.log('-------------------------------------\n'))
      beforeEach("insert cards", () => helpers.seedCardsTables(db, testUsers, testCards));

      it("Creates a new comment, responding with 201 and the new comment", function () {
        // this.retries(2)
        const testCard = testCards[0];
        const testUser = testUsers[0];
        const newComment = { body: "Testing new comment", card_id: testCard["id"] }
        console.log(testCard["id"])
        return supertest(app)
          .post("/api/comments")
          .set("Authorization", helpers.makeAuthHeader(testUsers[0]))
          .send(newComment)
          .expect(201)
          .expect((res) => {
            console.log(res.headers.location)
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('user')
            expect(res.body.body).to.eql(newComment.body)
            expect(res.body.user.id).to.eql(testUser.id)
            expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
            const expectedDate = new Date().toLocaleString('en', { timeZone: 'America/Los_Angeles' })
            const actualDate = new Date(res.body.date_created).toLocaleString()
            expect(actualDate).to.eql(expectedDate)
          })
      });
    })
  });

  describe(`GET for api/comments/comment_id`, () => {
    // beforeEach("insert things", () => helpers.seedCardsTables(db, testUsers, testUsers, testCards, testComments, testReacts));

    after("spacing", () => console.log('-------------------------------------\n'))
    it("GET / responds with 200", () => {
      return supertest(app)
        .get("/")
        .expect(200);
    });
  })

  describe(`PATCH for api/comments/comment_id`, () => {
    // beforeEach("insert things", () => helpers.seedCardsTables(db, testUsers, testUsers, testCards, testComments, testReacts));

    after("spacing", () => console.log('-------------------------------------\n'))
    it("GET / responds with 200", () => {
      return supertest(app)
        .get("/")
        .expect(200);
    });
  })

  describe(`DELETE for api/comments/comment_id`, () => {
    // beforeEach("insert things", () => helpers.seedCardsTables(db, testUsers, testUsers, testCards, testComments, testReacts));
    it("GET / responds with 200", () => {
      return supertest(app)
        .get("/")
        .expect(200);
    });
  })


})