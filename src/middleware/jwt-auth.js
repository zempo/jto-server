const AuthService = require('../services/auth-service')

function requireAuth(req, res, next) {
    const authToken = res.get("Authorization") || "";

    let bearerToken;
    if (!authToken.toLowerCase().startsWith("bearer ")) {
        return res.status(401).json({ error: "Missing Bearer Token" })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithUserName(req.app.get("db"), payload.sub)
            .then((user) => {
                if (!user) {
                    return res.status(401).json({ error: "Unauthorized Request" })
                }

                req.user = user
                next()
            })
            .catch((err) => {
                console.error(err)
                next(err)
            })
    } catch (error) {
        res.status(401).json({ error: "Unauthorized Request" })
    }
}

module.exports = { requireAuth }