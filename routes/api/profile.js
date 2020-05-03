const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, async (req, res) => {
    try {
				const userProfile = await Profile.findOne({ user: req.user.id })
				.populate('user', ['name', 'avatar']);

				if (!userProfile) return res.status(400).send({msg: 'No profile found for this user!'});
		
				return res.json(profile);
			} catch (err) {
        console.error(err);
        return res.status(500).send('Server Error!');
    }
});

// @route   POST api/profile
// @desc    Create/Update user's profile
// @access  Private
router.post('/', [auth, [
	check('status', 'status is required').not().isEmpty(),
	check('skills', 'skills is required').not().isEmpty()
]], async (req, res) => {
	const errors = validationResult(req);
	if(!errors.isEmpty()) {
		return res.status(400).send({ errors: errors.array() });
	}

	const { company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin } = req.body;

	// Build profile Object
	const profileFields = {
		user: req.user.id,
		company: !!company ? company : null,
		website: !!website ? website : null,
		location: !!location ? location : null,
		bio: !!bio ? bio : null,
		status: !!status ? status : null,
		githubusername: !!githubusername ? githubusername : null,
		skills: !!skills ? skills.split(',').map(skill => skill.trim()) : null,
		social: {
			youtube: !!youtube ? youtube : null,
			twitter: !!twitter ? twitter : null,
			facebook: !!facebook ? facebook : null,
			linkedin: !!linkedin ? linkedin : null,
			instagram: !!instagram ? instagram : null
		}
	};

	try {
		let profile = await Profile.findOne({ user: req.user.id });
		// Does this profile already exist?
		// If yes, then update it's data
		// Else, Create a new profile for the user
		if (profile) {
			profile = await Profile.findOneAndUpdate({user: req.user.id}, { $set: profileFields }, { new: true });
			return res.json(profile);
		}

		// Create the profile here
		const insertProfileRes = await Profile.create(profileFields);
		if (!insertProfileRes) throw "Something went wrong! Could not insert Profile Data!"
		await insertProfileRes.save();
		return res.json(insertProfileRes);
	} catch(err) {
		console.error(err);
		res.status(500).send('Server Error');
	}
});

// @route   GET api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', async (req, res) => {
	try {
		const profiles = await Profile.find().populate('user', ['name', 'avatar']);
		res.json(profiles);
	} catch (err) {
		console.error(err);
		return res.status(500).send('Server Error');
	}
});

module.exports = router;