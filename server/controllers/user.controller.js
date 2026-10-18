import { User } from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import sendMail from '../utils/nodeMail.js';
import redisClient from '../utils/redisClient.js';

// CRITICAL FIX: Cross-Domain Cookie Configuration for Render/Vercel
const cookieOptions = {
    httpOnly: true,
    secure: true,       // MUST be true to allow cross-origin cookies on HTTPS
    sameSite: 'none',   // MUST be 'none' to allow the frontend domain to read the backend cookie
    maxAge: 15 * 60 * 1000 // 15 minutes
};

// STEP 1: Initiate Registration (Creates unverified shell & sends OTP)
export const register = async (req, res, next) => {
    const { email } = req.body;
 
    try {
        if (!email) return res.status(400).json({ status: false, message: "Email is required" });
       
        const formatedEmail = email.toLowerCase();

        if (!formatedEmail.endsWith('@gmail.com')) {
            return res.status(400).json({ status: false, message: "Invalid email id." });
        }

        const existingUser = await User.findOne({ email: formatedEmail });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ status: false, message: 'User already exists and is verified.' });
        }   
        
        const otp = Math.floor(Math.random() * 900000) + 100000;
        const sendTime = new Date().getTime();
        
        const registrationToken = jwt.sign({ email: formatedEmail }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const sessionData = {
            email: formatedEmail,
            otp: otp,
            sendTime: sendTime // Safely passing the defined variable here
        };
       
        // REDIS MAGIC: Store OTP in RAM with a strict 180-second (3 minute) Time-To-Live
        await redisClient.setEx(`otp_session:${registrationToken}`, 180, JSON.stringify(sessionData));

        await sendMail(formatedEmail, 'Your Registration OTP', `Your security code is ${otp}. It expires in 3 minutes.`);
        console.log("Otp : ", otp);

        // Issue the registration_session cookie (Used by Super Guard)
        res.cookie('registration_session', registrationToken, { ...cookieOptions });
       
        res.status(200).json({ message: 'OTP sent successfully to your email.', status: true });

    } catch (error) {
        next(error);
    } 
};

// STEP 2: Verify Registration OTP
export const verifyRegistrationOtp = async (req, res, next) => {
    const { email, otp } = req.body; 
    const token = req.cookies.registration_session;

    try {
        if (!token) return res.status(401).json({ status: false, message: "Session expired." });

        // FETCH FROM REDIS
        const redisDataStr = await redisClient.get(`otp_session:${token}`);

        // If Redis returns null, the TTL expired and the OTP deleted itself!
        if (!redisDataStr) {
            return res.status(400).json({ status: false, message: "OTP has expired or is invalid." });
        }

        const redisData = JSON.parse(redisDataStr);
        if (redisData.email !== email.toLowerCase() || String(redisData.otp) !== String(otp)) {
            return res.status(400).json({ status: false, message: "Invalid OTP." });
        }

        // On success, manually delete the OTP from RAM
        await redisClient.del(`otp_session:${token}`);

        // OTP is valid. Issue a temporary setup token allowing them to set a password
        const setupToken = jwt.sign({ email: redisData.email }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Swap the cookies: Clear the registration session, start the password setup session
        res.clearCookie('registration_session', { httpOnly: true, secure: true, sameSite: 'none' });
        res.cookie('setup_session', setupToken, { ...cookieOptions });

        res.json({ status: true, message: "OTP verified." });

    } catch (error) {
       next(error);
    }
};

// STEP 3: Finalize Account (Set Password)
export const finalizeAccount = async (req, res, next) => {
    const { password } = req.body;
    const token = req.cookies.setup_session;

    try {
        if (!token) return res.status(401).json({ status: false, message: "Session expired." });

        // Decode the setup token issued in Step 2
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        let user = await User.findOne({ email });
        
        if (!user) {
            user = new User({
                email: email,
                password: hashedPassword,
                isVerified: true,
                authProvider: 'local',
                refreshTokens: [] // Phase 3 safety check initialized
            });
        } else {
            user.password = hashedPassword;
            user.isVerified = true;
            if (!user.refreshTokens) user.refreshTokens = []; // Phase 3 safety check
        }    
        await user.save();

        // Clear the setup cookie so it can't be reused
        res.clearCookie('setup_session', { httpOnly: true, secure: true, sameSite: 'none' });
        res.json({ status: true, message: "Account created successfully." });

    } catch (error) {
        next(error);
    }
};

// 1. Check Auth Logic (Handshake for Guards)
export const checkAuth = async (req, res) => {
    try {
        // req.user was populated by verifyToken middleware
        const user = await User.findById(req.user.userId).select('email role name');
        if (!user) return res.status(404).json({ status: false, message: "User not found" });

        res.status(200).json({ 
            status: true, 
            email: user.email, 
            role: user.role,
            name: user.name || user.email.split('@')[0]
        });
    } catch (error) {
        res.status(500).json({ status: false, message: "Server Error" });
    }
};

// 2. Get Active Sessions
export const getSessions = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.status(200).json({ status: true, sessions: user.refreshTokens });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed to fetch sessions" });
    }
};

// 3. Revoke/Delete a specific session
export const revokeSession = async (req, res) => {
    const { sessionId } = req.params;
    try {
        const user = await User.findById(req.user.userId);
        user.refreshTokens = user.refreshTokens.filter(s => s._id.toString() !== sessionId);
        await user.save();
        res.status(200).json({ status: true, message: "Device logged out successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed to revoke session" });
    }
};