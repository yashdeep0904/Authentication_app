import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const PasswordGuard = () => {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    // 1. Intercept users who are already completely logged in
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axiosInstance.get('/check-auth');
                setIsLoggedIn(!!response.data.status);
            } catch (error) {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, []);

    if (isLoggedIn === null) return <h2>Verifying security...</h2>;

    // 2. Redirect to dashboard if they hit the back button after logging in
    if (isLoggedIn) {
        return <Navigate to="/dashboard" replace />;
    }

    // 3. Normal Guard for non-logged-in users completing registration
    const isVerified = location.state?.verified;
    if (isVerified) {
        return <Outlet />;
    }

    return <Navigate to="/login" replace />;
};

export default PasswordGuard;