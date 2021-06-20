const ensureAuth = (req, res, next) => {
    if (req.user) {
        next();
    } else {
        req.session.returnTo = req.originalUrl;
        res.redirect('/login');
    }
} 

module.exports = ensureAuth;