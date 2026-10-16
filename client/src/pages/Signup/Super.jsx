import React, { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import apis, { secureFetch } from '../../utils/apis'

const Super = () => {
    const [isAuth, setIsAuth] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(null);

    useEffect(() => {
        const verifyStatus = async () => {
            try {
                const authRes = await secureFetch(apis().checkAuth, { method: 'GET' });
                const authResult = await authRes.json();
                
                if (authRes.ok && authResult?.status) {
                    setIsLoggedIn(true);
                    return;
                }
                setIsLoggedIn(false);

                const regRes = await secureFetch(apis().getAccess, { method: "GET" });
                setIsAuth(regRes.ok);
            } catch (error) {
                setIsLoggedIn(false);
                setIsAuth(false);
            }
        };
        verifyStatus(); 
    }, []); 

    if (isLoggedIn === null || (isLoggedIn === false && isAuth === null)) {
        return <div className="flex justify-center items-center h-screen"><h2>Securing connection...</h2></div>;
    }
    
    if (isLoggedIn) return <Navigate to="/student/homepage" replace />;
    
    return isAuth ? <Outlet /> : <Navigate to="/signup" replace />;
}

export default Super;