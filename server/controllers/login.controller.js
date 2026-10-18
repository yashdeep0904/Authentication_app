import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt';

const cookieOptions = {
    httpOnly: true,
    secure: true,      
    sameSite: 'none'   
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const formatedEmail = email.toLowerCase();
        const findUser = await User.findOne({ email: formatedEmail });
        
        if (!findUser || !findUser.isVerified || !findUser.password) {
            return res.status(401).json({ status: false, message: 'Invalid credentials or account verification incomplete.' });
        }

        const isPassMatch = await bcrypt.compare(password, findUser.password);
        if (!isPassMatch) {
            const error = new Error('Password is incorrect');
            error.statusCode = 400;
            throw error;
        }

        const accessToken = jwt.sign({ userId: findUser._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: findUser._id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "7d" });

        const deviceInfo = req.headers['user-agent'] || "Unknown Device";
        const ipAddress = req.ip || req.connection.remoteAddress || "Unknown IP";

        if (!findUser.refreshTokens) {
            findUser.refreshTokens = [];
        }

        findUser.refreshTokens.push({ token: refreshToken, deviceInfo, ipAddress });
        await findUser.save();
        
       res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 }); 
       res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 }); 

       // CRITICAL FIX: Pass accessToken in the JSON body payload
       res.status(200).json({ 
           message: "Login successful", 
           status: true, 
           accessToken: accessToken, 
           role: findUser.role, 
           email: findUser.email 
       });

    } catch (error) {
        next(error);
    }
};