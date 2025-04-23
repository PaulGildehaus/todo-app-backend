const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.GOOGLE_CALLBACK_URL || 'https://localhost:5000'}/api/auth/google/callback`,
            scope: ['profile', 'email'],
            state: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if (!email) {
                    return done(new Error('No email found in Google profile'), null);
                }

                let user = await User.findOne({ email });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    } else if (user.googleId !== profile.id) {
                        return done(new Error('Email already in use.'), null);
                    }
                }
                else {
                    user = new User({
                        googleId: profile.id,
                        username: profile.displayName,
                        email: email
                    });
                    await user.save();
                }
                
                return done(null, user);
            } catch (error) {
                console.error('Google auth Error: ', error);
                return done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => {
    process.nextTick(() => {
        done(null, {
            id: user.id,
            strategy: 'google'
        });
    });
});

passport.deserializeUser(async (serialized, done) => {
    try {
        if (!serialized?.id) {
            return done(new Error('No user ID found'), null);
        }

        const user = await User.findById(serialized.id);
        if (!user) {
            return done(new Error('User not found'), null);
        }

        return done(null, user);
    } catch (error) {
        console.error('Deserialization Error: ', error);
        return done(error, null);
    }
});