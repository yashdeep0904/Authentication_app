import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import apis, { secureFetch } from '../../utils/apis'; 

const StudentGuard = () => {
    const [isAuth, setIsAuth] = useState(null);

    const checkStudentAuth = async () => {
        try {
            const response = await secureFetch(apis().checkAuth, { method: 'GET' });
            const result = await response.json();
            
            if (response.ok && result?.status) {
                setIsAuth(true);
            } else {
                localStorage.removeItem('accessToken');
                setIsAuth(false);
            }
        } catch (error) {
            localStorage.removeItem('accessToken');
            setIsAuth(false);
        }
    };

    useEffect(() => {
        checkStudentAuth();

        // BFCACHE FIX: Re-verify auth when page is restored from browser history
        const handlePageShow = (event) => {
            if (event.persisted) {
                checkStudentAuth();
            }
        };

        window.addEventListener('pageshow', handlePageShow);
        
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    if (isAuth === null) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50 text-slate-800">
                <h2>Securing connection...</h2>
            </div>
        );
    }
    
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
}

export default StudentGuard;