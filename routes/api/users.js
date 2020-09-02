const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const validationMiddleware =  [
    check('name').not().isEmpty().withMessage('Name is required!'),
    check('email').isEmail().withMessage('Please include a valid email!'),
    check('password').isLength({ min: 6}).withMessage('Please enter a password with 6 or more characters!')
];
// @route   POST api/users
// @desc    Register User
// @access  Public
router.post('/', validationMiddleware, async (req, res) => {
    try {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).send({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
        let user = await User.findOne({ email });

        if (user) return res.send('User Already Exists!');
        
        const avatar = await gravatar.url(email, {
           s: '200',
           r: 'pg',
           d: 'mm' 
        });
        
        user = await new User({
            name,
            email,
            avatar,
            password
        });

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);
        
        await user.save();
        
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