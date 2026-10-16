import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CountDown from "react-countdown"
import toast from 'react-hot-toast';
import apis, { secureFetch } from '../../utils/apis'; 

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email; 

  const [isLoading, setIsLoading] = useState(false);
  const [expireTime, setExpireTime] = useState(null);
  const [isExpire, setIsExpire] = useState(false);

  const ref1 = useRef(); const ref2 = useRef(); const ref3 = useRef();
  const ref4 = useRef(); const ref5 = useRef(); const ref6 = useRef();
  const inputRef = [ref1, ref2, ref3, ref4, ref5, ref6];

  const [otp1, setOtp1] = useState(""); const [otp2, setOtp2] = useState("");
  const [otp3, setOtp3] = useState(""); const [otp4, setOtp4] = useState("");
  const [otp5, setOtp5] = useState(""); const [otp6, setOtp6] = useState("");

  const otpArray = [setOtp1, setOtp2, setOtp3, setOtp4, setOtp5, setOtp6];
  const otpValues = [otp1, otp2, otp3, otp4, otp5, otp6];

  useEffect(() => {
    if (!email) {
      toast.error("Session missing. Please restart.");
      navigate('/forget/password');
      return;
    }

    const fetchOtpTime = async () => {
      try {
        const response = await secureFetch(apis().otpTime, { method: "GET" });
        const result = await response.json();
        if (response.ok && result?.status) {
          setExpireTime(result.sendTime);
          if (new Date().getTime() > result.sendTime) setIsExpire(true);
        } else {
          setIsExpire(true);
        }
      } catch (error) {
        setIsExpire(true);
      }
    };
    fetchOtpTime();
    if (ref1.current) ref1.current.focus();
  }, [email, navigate]);

  const resendHandler = async () => {
    try {
      setIsLoading(true);
      const response = await secureFetch(apis().forgetPassword, {
        method: "POST",
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message);

      if (result?.status) {
        toast.success("New OTP sent to your email!");
        setExpireTime(new Date().getTime() + (3 * 60 * 1000));
        setIsExpire(false);
        otpArray.forEach(setOtp => setOtp(""));
        ref1.current.focus();
      }
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const finalOtp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
    if (finalOtp.length < 6) return toast.error("Please enter a valid 6-digit OTP");

    try {
      setIsLoading(true);
      const response = await secureFetch(apis().otpVerify, {
        method: "POST",
        body: JSON.stringify({ email, otp: finalOtp }) 
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.message);

      if (result?.status) {
        toast.success(result?.message);
        navigate('/password/update',{
          replace: true, 
        state: { email: email, verified: true }
        }); 
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const inputChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    otpArray[index](value);
    if (value !== "" && index < 5) inputRef[index + 1].current.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && index > 0 && otpValues[index] === "") {
      inputRef[index - 1].current.focus();
    }
  };

  return (
    <div className='absolute top-0 bottom-0 left-0 right-0 z-10 flex items-center justify-center bg-slate-200/50 backdrop-blur-sm'>
      <form onSubmit={submitHandler} className='relative w-full max-w-md p-8 bg-white drop-shadow-2xl rounded-2xl text-slate-800 text-center mx-4'>
            
            <div className='mx-auto w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mb-4'>
                <span className='text-white text-2xl font-bold'>V</span>
            </div>
            
            <h1 className='text-2xl font-bold text-slate-900 mb-1'>Verify Your OTP</h1>
            <p className='text-slate-500 text-sm mb-6'>Enter 6-digit OTP here we just sent at your email</p>

            <div className='flex gap-3 mb-6 justify-center items-center'>
                {inputRef?.map((item,index)=>{
                return <input ref={item}
                    key={index} 
                    value={otpValues[index]}
                    onChange={(e)=>inputChange(e,index)}
                    onKeyDown={(e)=>{handleKeyDown(e,index)}}
                    onInput={(e)=>{
                    if(e.target.value.length>1){
                    e.target.value = e.target.value.slice(0,1)
                    }
                }} type='number' required className='h-12 w-12 rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center text-xl [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'/>
                }) }
            </div>

            <button type='submit' disabled={isLoading} className='w-full py-3 bg-emerald-500 text-white font-semibold rounded-lg text-sm cursor-pointer hover:bg-emerald-600 transition-colors disabled:opacity-70'>
                {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <div className='mt-4 flex items-center justify-center text-sm'>
                {expireTime !== null && !isExpire ? (
                    <span className="text-slate-500">Resend in <CountDown onComplete={()=>setIsExpire(true)} date={expireTime} /></span>
                ) : (
                    <span className='text-emerald-600 font-bold cursor-pointer hover:text-emerald-700' onClick={resendHandler}>Resend OTP</span>  
                )}
            </div> 

            <div className='mt-6 text-sm text-slate-600'>
                <Link to={'/student/login'} className='text-emerald-600 font-bold hover:text-emerald-700'>Back to Login</Link>
            </div>
      </form>
    </div>
  )
}

export default VerifyOtp