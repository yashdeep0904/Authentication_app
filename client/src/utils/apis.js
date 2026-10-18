const API_DOMAIN = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const USER_BASE = `${API_DOMAIN}/api/user`;
const ADMIN_BASE = `${API_DOMAIN}/api/admin`;

// CRITICAL FIX: Pull token and attach to headers dynamically
export const secureFetch = async (endpoint, options = {}, base = USER_BASE) => {
    const token = localStorage.getItem('accessToken'); 
    
    return fetch(`${base}${endpoint}`, {
        ...options,
        credentials: 'include', 
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Inject header
            ...options.headers
        }
    });
};

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