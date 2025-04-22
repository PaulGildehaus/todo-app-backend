const express = require('express');
const router = express.Router();
const passport = require('passport');

const AMPLIFY_URI = process.env.AMPLIFY_URI || 'http://localhost:3000';
const DOMAIN = process.env.DOMAIN_NAME || 'localhost';

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login', session: true }),
    (req, res) => {
        res.cookie('auth_verified', 'true', {
            httpOnly: false,
            secure: true,
            sameSite: 'none',
            domain: DOMAIN,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        });
        res.redirect(`${AMPLIFY_URI}/callback`);
    }
);

router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ isAuthenticated: true, user: req.user });
    } else {
        return res.json({ isAuthenticated: false });
    }
});

router.get('/logout', (req, res) => {
    req.logout((error) => {
        if (error) return res.status(500).json({ message: 'Logout Failed.' });
        res.redirect(AMPLIFY_URI);
    });
});

module.exports = router;