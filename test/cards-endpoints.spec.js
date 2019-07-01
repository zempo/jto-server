const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Cards endpoints', () => {
    let db;

    const { } = helpers.makeCardsFixtures()

    before('Instantiate knex', () => {
        db = knex({
            client: 'pg',
            connection: process.env.DB_TESTING_URL
        });
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/cards`, () => {
        context(`Given no public cards`, () => {
            it(`Responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/api/cards')
                    .expect(200, [])
            })
        })

        context(`Given existing public cards`, () => {
            beforeEach('insert cards', () => helpers.seedCardsTables())
        })
    })

})
