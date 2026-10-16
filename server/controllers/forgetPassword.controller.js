import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import redisClient from '../utils/redisClient.js';
import sendMail from '../utils/nodeMail.js';

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' };

const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const formatedEmail = email.toLowerCase();

        // 1. Verify User Exists
        const findUser = await User.findOne({ email: formatedEmail });
        if (!findUser) {
            return res.status(404).json({ status: false, message: 'User not found. Please register first.' });
        }

        // 2. Generate OTP and sendTime
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const sendTime = new Date().getTime(); // CRITICAL FIX for the timer

        // 3. Issue the tracking token
        const resetToken = jwt.sign({ email: formatedEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const sessionData = {
            email: formatedEmail,
            otp: otp,
            sendTime: sendTime
        };

        // 4. Save to Redis
        await redisClient.setEx(`otp_session:${resetToken}`, 180, JSON.stringify(sessionData));

        // 5. Send Email
        await sendMail(formatedEmail, 'Password Reset OTP', `Your password reset code is ${otp}. It expires in 3 minutes.`);
        console.log(otp);

        // 6. Set the Secure Cookie (Matches the Super Guard)
        res.cookie('registration_session', resetToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

        res.status(200).json({ status: true, message: 'OTP sent to your email.' });
    } catch (error) {
        next(error);
    }
};

export default forgetPassword;