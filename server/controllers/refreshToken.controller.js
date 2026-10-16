import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const refreshToken = async (req, res, next) => {
    try {
        // Read the 7-day refresh token cookie
        const currentRefreshToken = req.cookies.refresh_token;
        
        if (!currentRefreshToken) {
            return res.status(401).json({ status: false, message: "No refresh token found. Please login." });
        }

        // Verify the token
        jwt.verify(currentRefreshToken, process.env.REFRESH_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(403).json({ status: false, message: "Refresh token expired." });

            const user = await User.findById(decoded.userId);
            
            // Check if user exists and if the token is still valid in their active sessions
            if (!user || !user.refreshTokens.includes(currentRefreshToken)) {
                return res.status(403).json({ status: false, message: "Session revoked. Please login again." });
            }

            // Generate a fresh 15-minute access token
            const newAccessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });

            // Attach the fresh access token to the browser
            res.cookie('access_token', newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000
            });

            res.status(200).json({ status: true, message: "Token refreshed silently!" });
        });
    } catch (error) {
        next(error);
    }
};