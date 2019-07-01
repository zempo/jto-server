const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makeUsersArray() {
    return [
        {
            id: 1,
            user_name: "test-user-1",
            full_name: "Test User One",
            email: "test1@email.com",
            password: "password",
            date_created: "2029-01-22T16:28:32.615Z"
        },
        {
            id: 2,
            user_name: "test-user-2",
            full_name: "Test User Two",
            email: "test2@email.com",
            password: "password",
            date_created: "2029-01-22T16:28:32.615Z"
        },
        {
            id: 3,
            user_name: "test-user-3",
            full_name: "Test User Three",
            email: "test3@email.com",
            password: "password",
            date_created: "2029-01-22T16:28:32.615Z"
        },
        {
            id: 4,
            user_name: "test-user-4",
            full_name: "Test User Four",
            email: "test4@email.com",
            password: "password",
            date_created: "2029-01-22T16:28:32.615Z"
        }
    ]
}

function makeCardsArray(users) {
    return [
        {
            id: 1,
            theme: "cursive-plus",
            front_message: "Greeting 1",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "TRUE",
            user_id: users[2].id
        },
        {
            id: 2,
            theme: "indie",
            front_message: "Greeting 2",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "TRUE",
            user_id: users[3].id
        },
        {
            id: 3,
            theme: "cursive-plus",
            front_message: "Greeting 3",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "FALSE",
            user_id: users[1].id
        },
        {
            id: 4,
            theme: "cursive-plus",
            front_message: "Greeting 4",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "FALSE",
            user_id: users[1].id
        },
        {
            id: 5,
            theme: "cursive-plus",
            front_message: "Greeting 5",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "TRUE",
            user_id: users[1].id
        },
        {
            id: 6,
            theme: "cursive-plus",
            front_message: "Greeting 6",
            front_image: "https://loremflickr.com/g/500/400/flowers",
            inside_message: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?",
            inside_image: "https://loremflickr.com/g/300/300/flowers",
            date_created: "2029-01-22T16:28:32.615Z",
            public: "TRUE",
            user_id: users[4].id
        }
    ]
}

function makeCommentsArray(users, cards) {
    return [
        {
            id: 1,
            body: "comment 1",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[1].id,
            card_id: cards[2].id
        },
        {
            id: 2,
            body: "comment 2",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[2].id,
            card_id: cards[2].id
        },
        {
            id: 3,
            body: "comment 3",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[4].id,
            card_id: cards[1].id
        },
        {
            id: 4,
            body: "comment 4",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[3].id,
            card_id: cards[5].id
        },
        {
            id: 5,
            body: "comment 5",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[3].id,
            card_id: cards[6].id
        },
        {
            id: 6,
            body: "comment 6",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[3].id,
            card_id: cards[3].id
        },
        {
            id: 7,
            body: "comment 7",
            date_created: "2029-01-22T16:28:32.615Z",
            user_id: users[1].id,
            card_id: cards[4].id
        }
    ]
}

function makeReactsArray(users, cards) {
    return [
        {
            user_id: users[1].id,
            card_id: cards[2].id,
            react_heart: false,
            react_share: true
        },
        {
            user_id: users[2].id,
            card_id: cards[2].id,
            react_heart: true,
            react_share: true
        },
        {
            user_id: users[4].id,
            card_id: cards[1].id,
            react_heart: false,
            react_share: false
        },
        {
            user_id: users[3].id,
            card_id: cards[5].id,
            react_heart: false,
            react_share: true
        },
        {
            user_id: users[3].id,
            card_id: cards[6].id,
            react_heart: true,
            react_share: true
        },
        {
            user_id: users[4].id,
            card_id: cards[3].id,
            react_heart: false,
            react_share: true
        },
        {
            user_id: users[1].id,
            card_id: cards[4].id,
            react_heart: true,
            react_share: true
        }
    ]
}