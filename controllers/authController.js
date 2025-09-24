const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

exports.showSignup = (req, res) => res.render('signup');

exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!email || !password) return res.render('signup', { error: 'Fill required' });
    const existing = await userModel.findByEmail(email);
    if (existing) return res.render('signup', { error: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const userId = await userModel.createUser({ username, email, passwordHash: hash });
    req.session.user = { id: userId, username, email };
    res.redirect('/reviews');
  } catch (err) { next(err); }
};

exports.showLogin = (req, res) => res.render('login');

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findByEmail(email);
    if (!user) return res.render('login', { error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.render('login', { error: 'Invalid credentials' });
    req.session.user = { id: user.id, username: user.username, email: user.email };
    res.redirect('/reviews');
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};
