import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import apis, { secureFetch } from '../../utils/apis';

const PublicGuard = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    const checkAuth = async () => {
        try {
            const response = await secureFetch(apis().checkAuth, { method: 'GET' });
            const result = await response.json();
            setIsLoggedIn(!!result?.status && response.ok);
        } catch (error) {
            setIsLoggedIn(false);
        }
    };

    useEffect(() => {
        checkAuth();

        // BFCACHE FIX: Re-verify auth when page is restored from browser history
        const handlePageShow = (event) => {
            if (event.persisted) {
                checkAuth();
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    if (isLoggedIn === null) return null; 

    return isLoggedIn ? <Navigate to="/student/homepage" replace /> : <Outlet />;
};

export default PublicGuard;