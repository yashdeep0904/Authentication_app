import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';

// 1. Get all active devices for the logged-in user
export const getActiveSessions = async (req, res, next) => {
    try {
        // We decode the access token to securely get the user's ID
        const token = req.cookies.access_token;
        if (!token) return res.status(401).json({ status: false, message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        const user = await User.findById(decoded.userId);

        if (!user) return res.status(404).json({ status: false, message: "User not found" });

        // Format the data so we NEVER send the actual token string back to the frontend
        const safeSessions = user.refreshTokens.map(session => ({
            id: session._id,
            device: session.deviceInfo,
            ip: session.ipAddress,
            loginTime: session.createdAt,
            // Flag if this is the current device making the request
            isCurrentDevice: session.token === req.cookies.refresh_token 
        }));

        res.status(200).json({ status: true, sessions: safeSessions });
    } catch (error) {
        next(error);
    }
};

// 2. Remotely log out a specific device
export const revokeSession = async (req, res, next) => {
    const { sessionId } = req.params; // The ID of the session to destroy
    try {
        const token = req.cookies.access_token;
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
        
        // Remove that specific session from the user's array
        await User.findByIdAndUpdate(decoded.userId, {
            $pull: { refreshTokens: { _id: sessionId } }
        });

        res.status(200).json({ status: true, message: "Device successfully logged out." });
    } catch (error) {
        next(error);
    }
};