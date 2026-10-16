
import jwt from 'jsonwebtoken';
import redisClient from '../utils/redisClient.js';


const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' };

const verifyOtp = async (req, res, next) => {
    const { otp } = req.body;
    // Safely pull the token from the HTTP-Only cookie
    const token = req.cookies.registration_session;

    try {
        if (!token) return res.status(401).json({ status: false, message: 'Session expired. Please request a new OTP.' });

        // Fetch from Redis
        const redisDataStr = await redisClient.get(`otp_session:${token}`);
        if (!redisDataStr) return res.status(400).json({ status: false, message: 'OTP expired or invalid.' });

        const redisData = JSON.parse(redisDataStr);

        // Check if OTP matches
        if (redisData.otp !== otp) {
            return res.status(400).json({ status: false, message: 'Incorrect OTP.' });
        }

        // Delete OTP from Redis so it cannot be reused
        await redisClient.del(`otp_session:${token}`);

        // Issue the setup_session token (Unlocks the Password Update page)
        const setupToken = jwt.sign({ email: redisData.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Swap the cookies
        res.clearCookie('registration_session');
        res.cookie('setup_session', setupToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

        res.status(200).json({ status: true, message: 'OTP verified! Proceed to update password.' });
    } catch (error) {
        next(error);
    }
};

export default verifyOtp;