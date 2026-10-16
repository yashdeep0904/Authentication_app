// Automatically resolves to your live backend in production, or falls back to localhost in development
const API_DOMAIN = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const USER_BASE = `${API_DOMAIN}/api/user`;
const ADMIN_BASE = `${API_DOMAIN}/api/admin`;

// 1. Export the secure fetch wrapper
// It now takes a 'base' argument to decide if it's hitting user or admin routes
export const secureFetch = async (endpoint, options = {}, base = USER_BASE) => {
    return fetch(`${base}${endpoint}`, {
        ...options,
        credentials: 'include', // Allows HTTP-Only cookies
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
};

// 2. Export the endpoints
const apis = () => {
    return {
        registerUser: '/register',
        verifyRegistrationOtp: '/verify-otp',
        setPassword: '/set-password',
        loginUser: '/login',
        forgetPassword: '/forget/password',
        otpVerify: '/otp/verify',
        updatePassword: '/password/update',
        otpTime: `/otp/time`,
        logoutUser: '/logout',
        getAccess: `/get/access`,
        checkAuth: '/check-auth',
        checkSetup: '/check-setup',
        getSessions: '/sessions',
        revokeSession: (sessionId) => `/sessions/${sessionId}`,
        googleLogin: `${USER_BASE}/google/login`,
    }
}

export default apis;
export { USER_BASE, ADMIN_BASE };