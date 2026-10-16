import React, { useState } from 'react'
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import apis, { secureFetch } from '../../utils/apis';
import toast from 'react-hot-toast';

const UpdatePassword = () => {
    const[visible,setVisible] = useState(false)
    const[password,setPassword] = useState("")
    const[confirmPassword,setConfirmPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate()
    
    const submitHandler= async(e)=>{
        e.preventDefault()
        setIsLoading(true);
        
        try {
            if (password !== confirmPassword) return toast.error("Passwords do not match");
            if (password.length < 6) return toast.error("Password must be at least 6 characters");
            
            const response = await secureFetch(apis().updatePassword,{
                method:"POST",
                body:JSON.stringify({password,confirmPassword}),
            })
            const result = await response.json()
            if(!response.ok){
                throw new Error(result?.message)
            }
            if(result?.status){
                toast.success(result?.message)
                navigate('/student/login')
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setIsLoading(false)
        }    
    }
    
  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm'>
        <form onSubmit={submitHandler} className='relative w-full max-w-md p-8 bg-white drop-shadow-2xl rounded-2xl text-slate-800 text-center mx-4'>
            
            <div className='mx-auto w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-white text-2xl font-bold'>U</span>
            </div>
            
            <h1 className='text-2xl font-bold text-slate-900 mb-1'>New Password</h1>
            <p className='text-slate-500 text-sm mb-6'>Enter at least 6-digit long password</p>

            <div className='space-y-4 text-left'>
                <div className="relative">
                    <input 
                        type={visible ? "text" : "password"} 
                        onChange={(e)=>setPassword(e.target.value)} 
                        value={password} 
                        placeholder='Enter your password' 
                        minLength={6} 
                        required 
                        className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    />  
                    <div className='absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-slate-600' onClick={() => setVisible(!visible)}>
                        {visible ? <IoMdEyeOff className='w-5 h-5'/> : <IoMdEye className='w-5 h-5'/>}
                    </div>
                </div>

                <div className="relative">
                    <input 
                        type={visible ? "text" : "password"} 
                        onChange={(e)=>setConfirmPassword(e.target.value)} 
                        value={confirmPassword} 
                        minLength={6} 
                        placeholder='Confirm password' 
                        required 
                        className='w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm' 
                    />  
                    <div className='absolute right-3 top-3 cursor-pointer text-slate-400 hover:text-slate-600' onClick={() => setVisible(!visible)}>
                        {visible ? <IoMdEyeOff className='w-5 h-5'/> : <IoMdEye className='w-5 h-5'/>}
                    </div>
                </div>
            </div>

            <button type='submit' disabled={isLoading} className='w-full mt-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-70'>
                {isLoading ? 'Updating...' : 'Update Password'}
            </button>

            <div className='mt-6 text-sm text-slate-600'>
                <Link to={'/login'} className='text-emerald-600 font-bold hover:text-emerald-700'>Back to Login</Link>
            </div>
        </form>
    </div>
  )
}

export default UpdatePassword