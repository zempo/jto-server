const xss = require('xss');
const Treeize = require('treeize');

const CardsService = {
    getPublicCards(db) {
        return db
            .from('jto_cards AS card')
            .select(
                'card.id',
                'card.theme',
                'card.front_message',
                'card.front_image',
                'card.inside_message',
                'card.inside_image',
                ...userFields,
                db.raw(
                    `count(nullif(reacts.react_heart, false)) AS number_of_hearts`
                ),
                db.raw(
                    `count(nullif(reacts.react_share, false)) AS number_of_shares`
                ),
                db.raw(
                    `count(DISTINCT comments) AS number_of_comments`
                )
            )
            .leftJoin(
                'jto_reacts AS reacts',
                'card.id',
                'react.card_id'
            )
            .leftJoin(
                'jto_comments AS comments',
                'card.id',
                'comments.card_id'
            )
            .leftJoin(
                'jto_users AS usr',
                'card.user_id',
                'usr.id'
            )
            .where('card.public', true)
            .groupBy('card.id', 'usr.id')
    },
    getPrivateCards(db, id) {
        return db
            .from('jto_cards AS cards')
            .select(
                'card.id',
                'card.theme',
                'card.front_message',
                'card.front_image',
                'card.inside_message',
                'card.inside_image',
                ...userFields,
            )
            .leftJoin(
                'jto_users AS usr',
                'card.user_id',
                'usr.id'
            )
            .where({
                'usr.id': id,
                'card.public': false
            })

    },
    getPublicById(id) {

    },
}

const userFields = [
    'usr.id AS user:id',
    'usr.user_name AS user:user_name',
    'usr.full_name AS user:full_name',
    'usr.email AS user:email',
    'usr.date_created AS user:date_created',
    'usr.date_modified AS user:date_modified'
]

module.exports = CardsService