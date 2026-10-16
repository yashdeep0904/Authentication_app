import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import axios from 'axios';

// Shared secure cookie settings
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
};

// 1. INITIATE: Redirect user to Google's consent screen
export const googleAuthInitiate = (req, res) => {
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const options = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: `${process.env.BACKEND_URL}/api/user/google/callback`,
        access_type: 'offline',
        response_type: 'code',
        prompt: 'consent',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email',
        ].join(' '),
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
};

// 2. CALLBACK: Handle the data Google sends back
export const googleAuthCallback = async (req, res, next) => {
    const code = req.query.code;

    try {
        if (!code) throw new Error("Google authorization failed.");

        // A. Exchange the code for a Google Access Token
        const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.BACKEND_URL}/api/user/google/callback`,
            grant_type: 'authorization_code',
        });

        // B. Fetch the user's profile from Google
        const googleUser = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
        });

        const { email } = googleUser.data;
        const formatedEmail = email.toLowerCase();

        // C. Find or Create the User in MongoDB
        let user = await User.findOne({ email: formatedEmail });

        if (!user) {
            // Auto-register the user if they don't exist
            user = await User.create({
                email: formatedEmail,
                isVerified: true, // Google already verified their email!
                authProvider: 'google',
            });
        }

        // D. Generate our App's Secure Tokens
        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "7d" });

        // E. ADVANCED: Capture Device/IP for Session Management
        const deviceInfo = req.headers['user-agent'] || "Unknown Device (Google SSO)";
        const ipAddress = req.ip || req.connection.remoteAddress;

        user.refreshTokens.push({
            token: refreshToken,
            deviceInfo: deviceInfo,
            ipAddress: ipAddress
        });
        await user.save();

        // F. Set the HTTP-Only Cookies
        res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

        // G. Redirect back to the React Frontend Dashboard
        // (Make sure to add FRONTEND_URL=http://localhost:5173 to your backend .env file)
        res.redirect(`${process.env.FRONTEND_URL}/student/homepage`);

    } catch (error) {
        console.error("Google Auth Error:", error.message);
        res.redirect(`${process.env.FRONTEND_URL}/student/login?error=GoogleAuthFailed`);
    }
};