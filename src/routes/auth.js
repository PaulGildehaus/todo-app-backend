const express = require('express');
const router = express.Router();
const passport = require('passport');

const AMPLIFY_URI = process.env.AMPLIFY_URI || 'http://localhost:3000';
const DOMAIN = process.env.NODE_ENV === 'production' ? process.env.DOMAIN_NAME : 'localhost';

// Force the account selection screen to show up every time the user logs in
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' 
}));

// Callback route for Google to redirect to after authentication
router.get(
    '/google/callback',
    passport.authenticate('google', { 
        failureRedirect: `${AMPLIFY_URI}/login`,
        session: true 
    }),
    (req, res) => {
        console.log('OAuth successful! User:', req.user);
        res.redirect(`${AMPLIFY_URI}/callback`);
    }
);

// Route to check if the user is authenticated
router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ 
            isAuthenticated: true, 
            user: {
                id: req.user._id,
                username: req.user.username,
                email: req.user.email,
            }
        });
    } else {
        return res.status(401).json({ isAuthenticated: false });
    }
});

module.exports = router;