import rateLimit from 'express-rate-limit';

// 1. OTP Limiter: Extremely strict to prevent email spam
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 5 requests per windowMs
    message: { 
        status: false, 
        message: "Too many OTP requests from this IP. Please try again after 15 minutes." 
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// 2. Login Limiter: Prevents brute-force password guessing
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login attempts per windowMs
    message: { 
        status: false, 
        message: "Too many login attempts. Your IP has been temporarily locked." 
    },
    standardHeaders: true,
    legacyHeaders: false,
});