const { rawListeners } = require("../models/test.model");

module.exports.authRequire = (req, res, next) => {
    // return next();
    console.log(res.locals.history);
    if (req.user) { return next(); }
    res.cookie('history', res.locals.history, { expires: new Date(Date.now() + 3600 * 1000), httpOnly: true });
    req.flash('warning', 'Đăng nhập đã bạn ôi.');
    res.redirect('/auth/login');
}

module.exports.adminRequire = (req, res, next) => {
    // return next();
    if (!req.user) {
        res.redirect('/');
        return;
    }
    if (req.user.role == 'admin') { return next(); }
    res.cookie('history', req.originalUrl, { expires: new Date(Date.now() + 3600), httpOnly: true });
    req.flash('history', req.originalUrl);
    req.flash('warning', 'Admin mới thực hiện được chức năng này bạn ạ.');
    res.redirect(res.locals.history);
}