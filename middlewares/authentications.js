const { validateToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];

        // If the token cookie doesn't exist, proceed to the next middleware
        if (!tokenCookieValue) {
            return next(); // Proceed to the next middleware if no token exists
        }

        try {
            const userPayload = validateToken(tokenCookieValue);
            req.user = userPayload; // Attach user data to `req`
            return next(); // Proceed to the next middleware
        } catch (error) {
            console.error("Error validating token:", error);
            // Send an unauthorized error response
            return res.status(401).json({ message: 'Invalid or expired token. Please log in.' });
        }
    };
}

module.exports = {
    checkForAuthenticationCookie,
};
