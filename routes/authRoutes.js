const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/', (req, res) => {
  res.render('index'); 
});

// Change /signup to /register
router.get('/register', authController.showSignup);
router.post('/register', authController.signup);

router.get('/login', authController.showLogin);
router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;