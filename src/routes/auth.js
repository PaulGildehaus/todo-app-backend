const express = require('express');
const router = express.Router();
const passport = require('passport');

const AMPLIFY_URI = process.env.AMPLIFY_URI || 'http://localhost:3000';
const DOMAIN = process.env.NODE_ENV === 'production' ? `.${process.env.DOMAIN_NAME}` : 'localhost';

router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    prompt: 'select_account' 
}));

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

router.get('/check', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ 
            isAuthenticated: true, 
            user: {
                id: req.user.googleId,
                username: req.user.username,
                email: req.user.email,
            }
        });
    } else {
        return res.status(401).json({ isAuthenticated: false });
    }
});

router.get('/logout', (req, res) => {
    req.logout((error) => {
        if (error) return res.status(500).json({ message: 'Logout Failed.' });

        req.session.destroy((err) => {
            if (err) return res.status(500).json({ message: 'Session destruction failed.' });
        });
        res.clearCookie('connect.sid', { 
            domain: DOMAIN,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        });
        res.redirect(AMPLIFY_URI);
    });
});

module.exports = router;