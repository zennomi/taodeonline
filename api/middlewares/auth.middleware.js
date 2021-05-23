module.exports.authRequire = (req, res, next) => {
    // return next();
    if (req.user) { return next(); }
    res.status(401).json({error: "Yêu cầu đăng nhập."});
}

module.exports.adminRequire = (req, res, next) => {
    // return next();
    if (req.user && req.user.isAdmin) { return next(); }
    req.status(403).json({error: 'Yêu cầu quyền admin.'});
}