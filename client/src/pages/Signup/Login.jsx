import React, { useEffect, useState } from 'react';
import { IoLogoGoogle } from "react-icons/io";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import apis, { secureFetch } from '../../utils/apis';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [visible, setVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tokenFromURL = urlParams.get('token');
        const errorFromURL = urlParams.get('error');

        if (tokenFromURL) {
            localStorage.setItem('accessToken', tokenFromURL);
            toast.success("Successfully logged in with Google!");
            navigate('/student/portal/home', { replace: true }); 
        }

        if (errorFromURL === 'AccountNotFound') {
            toast.error("Google ID does not exist in our database. Please register first.");
            navigate('/registration', { replace: true }); 
        }
    }, [location, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await secureFetch(apis().loginUser, {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result?.message || "Login failed");
            }
            if (result?.status) {
                toast.success(result?.message);
                navigate('/dashboard', { replace: true });
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleLogin = (e) => {
        e.preventDefault();
        window.location.href = apis().googleLogin; 
    };

  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm'>
        <form onSubmit={submitHandler} className='relative w-full max-w-md p-8 bg-white drop-shadow-2xl rounded-2xl text-slate-800 text-center mx-4'>
            
            <div className='mx-auto w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-white text-2xl font-bold'>L</span>
            </div>
            
            <h1 className='text-2xl font-bold text-slate-900 mb-1'>Welcome Back</h1>
            <p className='text-slate-500 text-sm mb-6'>Login to continue</p>
            
            <div className='space-y-4 text-left'>
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    placeholder='Enter your email' 
                    className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    required 
                />
                <div className="relative">
                    <input 
                        onChange={(e) => setPassword(e.target.value)} 
                        value={password} 
                        type={visible ? "text" : "password"} 
                        placeholder='Enter your password' 
                        className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                        required  
                    /> 
                    <div className='absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-slate-600' onClick={() => setVisible(!visible)}>
                        {visible ? <IoMdEyeOff className='w-5 h-5'/> : <IoMdEye className='w-5 h-5'/>}
                    </div>
                </div>
            </div>

            <div className='text-right mt-3 mb-6'>
                <Link to={'/forget/password'} className='cursor-pointer text-emerald-600 text-sm font-semibold hover:text-emerald-700'>Forgot Password?</Link>
            </div>

            <button type='submit' disabled={isLoading} className='w-full py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-70'>
                {isLoading ? 'Logging in...' : 'Login securely'}
            </button>

            <div className='mt-6 text-sm text-slate-600'>
                <span>Don't have an account? </span>
                <Link to={'/signup'} className='text-emerald-600 font-bold hover:text-emerald-700 cursor-pointer'>Create new Account</Link>
            </div>

            <div className='mt-6 pt-6 border-t border-slate-100 flex justify-center'>
                <button type="button" onClick={handleGoogleLogin} className='flex items-center justify-center w-full py-2.5 gap-2 border border-slate-200 rounded-lg text-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors'> 
                    <IoLogoGoogle className='w-4 h-4'/> Continue with Google 
                </button>
            </div>
        </form>
    </div>
  )
}

export default Login;