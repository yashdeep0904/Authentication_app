import jwt from "jsonwebtoken";
import { User } from "../models/user.js";
import bcrypt from 'bcrypt'

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
};

const login = async(req,res,next)=>{
    const {email,password} = req.body

    try {
        
        const formatedEmail = email.toLowerCase();

        const findUser = await User.findOne({email:formatedEmail})
        
        if (!findUser || !findUser.isVerified || !findUser.password) {
            return res.status(401).json({ status: false, message: 'Invalid credentials or account verification incomplete.' });
        }

        const isPassMatch = bcrypt.compare(password,findUser.password)
        if(!isPassMatch){
            const error = new Error('Password is incorrect')
            error.statusCode = 400
            throw error
        }

       // Create Tokens
        const accessToken = jwt.sign({ userId: findUser._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "15m" });
        const refreshToken = jwt.sign({ userId: findUser._id }, process.env.REFRESH_TOKEN_KEY,{ expiresIn: "7d" });

        // CAPTURE DEVICE DATA
        const deviceInfo = req.headers['user-agent'] || "Unknown Device";
        const ipAddress = req.ip || req.connection.remoteAddress;

        // --- ADD THIS SAFETY CHECK ---
        if (!findUser.refreshTokens) {
            findUser.refreshTokens = [];
        }

        // Save session data to DB
        findUser.refreshTokens.push({
            token: refreshToken,
            deviceInfo: deviceInfo,
            ipAddress: ipAddress
        });
        await findUser.save();
        
       // Send BOTH tokens as Secure Cookies
       res.cookie('refresh_token', refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });
       res.cookie('access_token', accessToken, { ...cookieOptions, maxAge: 15 * 60 * 1000 });

        // Send Access token to frontend memory (or also as a cookie, depending on your architecture)
        res.status(200).json({ message: "Login successful", status: true });

    } catch (error) {
        next(error)
    }
}

export default login