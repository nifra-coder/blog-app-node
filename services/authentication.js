const jwt = require('jsonwebtoken');
const secret = '$AFrin12#41';

function createTokenForUser(user) {
    const payload = {
        _id: user._id,
        fullName: user.fullName,  // Make sure fullName is included
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };

    const token = jwt.sign(payload, secret);
    return token;
}

function validateToken(token) {
    const payload = jwt.verify(token, secret);
    return payload;
}

module.exports = { createTokenForUser, validateToken };
