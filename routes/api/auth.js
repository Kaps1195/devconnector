const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Test Route
// @access  Public
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server Error!');
    }
});


const validationMiddleware =  [
    check('email').isEmail().withMessage('Please include a valid email!'),
    check('password', 'Password is required').exists()
];
// @route   POST api/auth
// @desc    Authenticate User and get token
// @access  Public
router.post('/', validationMiddleware, async (req, res) => {
    try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const { email, password } = req.body;
        let user = await User.findOne({ email });

        if (!user) return res.status(400).send('Invalid Credentials!');

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) res.status(400).send('Invalid Credentials!');

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token });
        });

    } catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;