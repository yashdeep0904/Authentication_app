import passport from "passport";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from "../models/user.js"; 
import dotenv from 'dotenv'; // 1. Import dotenv

dotenv.config(); // 2. Call config() to load the variables immediately

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:8000/api/user/google/callback',
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    
    try {
        const action = req.query.state; 

        let user = await User.findOne({ email: profile.emails[0].value });

        if (action === "login") {
            if (!user) {
                return done(null, false); 
            }
            return done(null, user);
        }

        if (action === "signup") {
            if (!user) {
                user = await User.create({
                   
                    email: profile.emails[0].value,
                    googleId: profile.id
                });
            }
            return done(null, user);
        }
        
    } catch (error) {
        return done(error, null);
    }
}));

export default passport;