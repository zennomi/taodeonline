function Response(path, status, error, message){
    this.timestamp = new Date(),
    this.status = status || 200,
    this.error = error || "No error to show",
    this.message = message || "No message available",
    this.path = path
};


module.exports.authRequire = (req, res, next) => {
    let response = new Response("/auth/login");
    // return next();
    if (req.user) { return next(); }
    response.message = "Yêu cầu đăng nhập." ;
    response.status = 401;
    res.status(401).json({response});
}

module.exports.adminRequire = (req, res, next) => {
    let response = new Response("/auth/login");
    // return next();
    if (req.user && req.user.isAdmin) { return next(); }
    response.message = 'Yêu cầu quyền admin.';
    response.status = 403;
    req.status(403).json({response});
}