import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast';
import apis, { secureFetch } from '../../utils/apis';

const ForgotPassword = () => {
    const[email,setEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()

    const submitHandler = async(e)=>{
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await secureFetch(apis().forgetPassword,{
                method:"POST",
                body:JSON.stringify({email}),
            })
            const result = await response.json()
            if(!response.ok){
                throw new Error(result?.message)
            }
            if(result?.status){
                toast.success(result?.message)
                navigate('/verify/otp', { state: { email } });
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false);
        }
    }
    
  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm'>
        <form onSubmit={submitHandler} className='relative w-full max-w-md p-8 bg-white drop-shadow-2xl rounded-2xl text-slate-800 text-center mx-4'>
            
            <div className='mx-auto w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-white text-2xl font-bold'>F</span>
            </div>
            
            <h1 className='text-2xl font-bold text-slate-900 mb-1'>Forgot Password</h1>
            <p className='text-slate-500 text-sm mb-6'>Enter your registered email we will send a 6-digit OTP</p>
            
            <div className='space-y-4 text-left'>
                <input 
                    onChange={(e)=>setEmail(e.target.value)} 
                    value={email} 
                    type="email" 
                    placeholder='Enter your email' 
                    className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    required 
                />
            </div>

            <button type='submit' disabled={isLoading} className='w-full mt-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-70'>
                {isLoading ? 'Sending...' : 'Send OTP'}
            </button>

            <div className='mt-6 text-sm text-slate-600'>
                <Link to={'/student/login'} className='text-emerald-600 font-bold hover:text-emerald-700'>Back to Login</Link>
            </div>
        </form>
    </div>
  )
}

export default ForgotPassword