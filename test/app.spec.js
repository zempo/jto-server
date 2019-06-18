const app = require("../src/app");

describe("App smoke test", () => {
  it("GET / responds with 200", () => {
    return supertest(app)
      .get("/")
      .expect(200);
  });
});
