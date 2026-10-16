import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apis, { secureFetch } from '../../utils/apis'
import toast from 'react-hot-toast'

const Registration = () => {
  const [fullname, setFullname] = useState('')
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Enter the gmail");
      return;
    }
    
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      toast.error("Invalid email id. Only @gmail.com accounts are allowed.");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await secureFetch(apis().registerUser, {
        method: "POST",
        body: JSON.stringify({ email }) 
      });

      const result = await response.json();
      
      if (!response.ok) throw new Error(result?.message);

      if (result?.status) {
        setOtpSent(true);
        toast.success(result?.message);
        navigate('/verify/registration/otp', { state: { email } }); 
      }

    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }
  
  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm'>
        <form onSubmit={submitHandler} className='relative w-full max-w-md p-8 bg-white drop-shadow-2xl rounded-2xl text-slate-800 text-center mx-4'>
            
            <div className='mx-auto w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-white text-2xl font-bold'>R</span>
            </div>
            
      
            <p className='text-slate-800 font-semibold text-2xl mt-1 mb-6'>Welcome to Registration Page</p>
            
            <div className='space-y-4 text-left'>
                <input 
                    onChange={(e) => setFullname(e.target.value)} 
                    value={fullname} 
                    type="text" 
                    placeholder='Enter your fullname' 
                    className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    required 
                />
                <input 
                    onChange={(e) => setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    placeholder='Enter your @gmail.com email' 
                    className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    required 
                />
            </div>

            <button type='submit' disabled={isLoading} className='w-full mt-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-70 flex items-center justify-center'>
                {isLoading ? (
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : null}
                {isLoading ? 'Processing...' : 'Submit'}
            </button>

            {otpSent && (
                <div className='mt-4 pt-4 border-t border-slate-100'>
                    <p className='text-sm text-slate-600 mb-3'>An otp is sent to your email, verify Otp</p>
                    <Link to={'/verify/registration/otp'} className='w-full py-2.5 block border border-emerald-500 text-emerald-600 font-semibold rounded-lg text-sm hover:bg-emerald-50 transition-colors'>
                        Go To Verify Otp
                    </Link>
                </div>
            )}

            <div className='mt-6 text-sm text-slate-600'>
                <span>Already have an account? </span>
                <Link to={'/student/login'} className='text-emerald-600 font-bold hover:text-emerald-700'>Login</Link>
            </div>
        </form>
    </div>
  )
}

export default Registration