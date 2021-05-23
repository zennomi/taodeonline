const express = require('express')
const router = express.Router();
const passport = require('passport')

module.exports = (function () {

	router.get('/', function (req, res) {
		res.json({ user: req.user });
	});

	router.get('/login', function (req, res) {
		res.render('auth/login');
	});

	router.get('/account', ensureAuthenticated, function (req, res) {
		res.json({ user: req.user });
	});

	router.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

	router.get('/facebook/callback',
		passport.authenticate('facebook', { successRedirect: '/history', failureRedirect: '/login' }),
		function (req, res) {
			res.redirect('/history');
		});

	router.get('/logout', function (req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
})();


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login');
}