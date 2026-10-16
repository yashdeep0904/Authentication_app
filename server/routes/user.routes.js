import express from "express";
import { finalizeAccount, register, verifyRegistrationOtp } from "../controllers/user.controller.js";
import login from "../controllers/login.controller.js";
import forgetPassword from "../controllers/forgetPassword.controller.js";
import verifyOtp from "../controllers/verifyOtp.controller.js";
import getOtpTime from "../controllers/getOtpTime.controller.js";
import updatePassword from "../controllers/passwordUpdate.controller.js";
import getAccess from "../controllers/getAccess.controller.js";
import { logout } from "../controllers/logout.controller.js";
import { refreshToken } from "../controllers/refreshToken.controller.js";
import { googleAuthInitiate, googleAuthCallback } from "../controllers/googleAuth.controller.js";
import { getActiveSessions, revokeSession } from "../controllers/session.controller.js";
// Import Rate Limiters

import { requireRole, verifyToken } from "../middlewares/auth.middleware.js";
import * as userController from '../controllers/user.controller.js';
import { loginLimiter, otpLimiter } from "../utils/rateLimiter.js";


const router = express.Router();

// Apply otpLimiter to stop email/OTP spam bots
router.post('/register', otpLimiter, register);
router.post('/forget/password', otpLimiter, forgetPassword); 
router.post('/verify-otp', otpLimiter, verifyRegistrationOtp);
router.post('/otp/verify', otpLimiter, verifyOtp);

// Apply loginLimiter to stop password brute-force bots
router.post('/login', loginLimiter, login);

// Standard Routes (No limiters needed)
router.post('/set-password', finalizeAccount);
router.post('/password/update', updatePassword);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);
router.get('/otp/time', getOtpTime); 

// GOOGLE OAUTH 2.0 ROUTES

// Frontend triggers this by setting window.location.href = 'http://localhost:8000/api/user/google/login'
router.get('/google/login', googleAuthInitiate);

// Google redirects back to this endpoint with the user's data
router.get('/google/callback', googleAuthCallback);




// // Guard Verification
// router.get('/check-auth', (req, res) => {
//     if (req.cookies.access_token) return res.status(200).json({ status: true });
//     return res.status(401).json({ status: false });
// });

router.get('/check-setup', (req, res) => {
    if (req.cookies.setup_session) return res.status(200).json({ status: true });
    return res.status(401).json({ status: false });
});

router.get('/get/access', (req, res) => {
    if (req.cookies.registration_session) return res.status(200).json({ status: true });
    return res.status(401).json({ status: false });
});

// NEW: Active Session Management Routes
// router.get('/sessions', getActiveSessions);
// router.delete('/sessions/:sessionId', revokeSession);

router.get('/check-auth', verifyToken, userController.checkAuth);
router.get('/sessions', verifyToken, userController.getSessions);
router.delete('/sessions/:sessionId', verifyToken, userController.revokeSession);

export default router ;