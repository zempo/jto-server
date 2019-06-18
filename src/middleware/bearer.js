require('dotenv').config()

const bearer = (req, res, next) => {
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_KEY

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    next()
}

module.exports = bearer
