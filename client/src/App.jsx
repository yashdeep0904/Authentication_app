import { Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext" // 1. Import AuthProvider
import VerifyOtp from "./pages/Signup/VerifyOtp"
import UpdataPass from "./pages/Signup/UpdataPass"
import Registration from "./pages/Signup/Registeration"
import Login from "./pages/Signup/Login"
import ForgotPassword from "./pages/Signup/ForgotPassword"
import SetPassword from "./pages/Signup/SetPassword"
import VerifyRegistrationOtp from "./pages/Signup/VerifyRegistrationOtp"
import Super from "./pages/Signup/Super"
import PasswordGuard from "./pages/Signup/PasswordGuard"
import Dashboard from "./pages/Home/Dashboard"
import AuthGuard from "./pages/Signup/AuthGuard"


function App() {
  
  return (
    
    <AuthProvider>
      <div className={`min-h-screen w-full transition-colors duration-500  
       'bg-linear-to-b from-blue-300 to-rose-100' `}>

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login/>}/>
          <Route path="/signup" element={<Registration/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/forget/password" element={<ForgotPassword/>}/>
          
          {/* Phase 1: OTP Verification */}
          <Route element={<Super/>}>
            <Route path="/verify/otp" element={<VerifyOtp/>}/>
            <Route path="/verify/registration/otp" element={<VerifyRegistrationOtp/>}/>
          </Route>

          {/* Phase 2: Password Setup */}
          <Route element={<PasswordGuard/>}>
            <Route path="/password/update" element={<UpdataPass/>}/>
            <Route path="/set-password" element={<SetPassword/>}/>
          </Route>

          {/* Phase 3: Logged-in Student Portal */}
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
          </Route>

          {/* 4. CATCH-ALL */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

      </div>
    </AuthProvider>
  )
}

export default App