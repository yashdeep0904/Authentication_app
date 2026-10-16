import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    MdLogout, 
    MdNotifications, 
    MdSecurity, 
    MdPerson, 
    MdOutlineDashboard, 
    MdOutlineLightMode, 
    MdOutlineDarkMode,
    MdSettings, 
    MdHistory, 
    MdHelpOutline 
} from 'react-icons/md';
import apis, { secureFetch } from '../../utils/apis';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const auth = useAuth();
    const [userData, setUserData] = useState({ email: '', role: 'User', name: '' });

    // Fetch authenticated user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await secureFetch(apis().checkAuth, { method: 'GET' });
                const result = await res.json();
                if (res.ok && result?.status) {
                    setUserData({ 
                        email: result.email || 'User Account', 
                        role: result.role || 'Member',
                        name: result.name || result.email?.split('@')[0] || 'User'
                    });
                }
            } catch (err) {
                console.error("Auth check failed", err);
            }
        };
        fetchProfile();
    }, []);

    // Logout Handler
    const handleLogout = async () => {
        if (auth && auth.logout) {
            await auth.logout();
        } else {
            try {
                await secureFetch(apis().logoutUser, { method: "POST" });
            } catch (err) {
                console.error("Logout request failed:", err);
            } finally {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                toast.success("Logged out successfully");
                window.location.replace('/login');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 font-sans">
            
            {/* Top Navigation Bar */}
            <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        
                        {/* Application Brand */}
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-600 rounded-lg text-white shadow-lg shadow-emerald-500/20">
                                <MdOutlineDashboard size={24} />
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase">
                                USER <span className="text-emerald-600">PORTAL</span>
                            </span>
                        </div>

                        {/* Controls: Theme & Logout */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle */}
                            <button 
                                onClick={toggleTheme}
                                title="Toggle Dark/Light Mode"
                                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-amber-400 hover:ring-2 hover:ring-emerald-400 transition-all cursor-pointer"
                            >
                                {theme === 'light' ? <MdOutlineDarkMode size={20}/> : <MdOutlineLightMode size={20}/>}
                            </button>

                            {/* Sign Out Button */}
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 font-bold rounded-xl hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all border border-rose-200 dark:border-rose-900/30 cursor-pointer text-sm"
                            >
                                <span>Sign Out</span>
                                <MdLogout size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Header Banner */}
            <header className="bg-emerald-700 dark:bg-emerald-950 py-12 transition-colors border-b border-emerald-800/50">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
                            Welcome Back, {userData.name}!
                        </h1>
                        <p className="text-emerald-100 text-sm md:text-base opacity-90">
                            {userData.email}
                        </p>
                    </div>
                    
                    {/* User Badge */}
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/20 shadow-lg">
                        <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-lg uppercase shadow-inner">
                            {userData.email ? userData.email.charAt(0) : 'U'}
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-emerald-200 font-bold tracking-widest">Account Role</p>
                            <p className="text-white font-bold text-sm capitalize">{userData.role}</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                {/* Feature Cards Grid */}
                <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard 
                        icon={<MdPerson size={28}/>} 
                        title="Profile & Preferences" 
                        desc="Manage your personal information, display settings, and notification choices." 
                        color="bg-blue-600"
                    />
                    <DashboardCard 
                        icon={<MdSecurity size={28}/>} 
                        title="Security & Active Sessions" 
                        desc="Monitor logged-in devices, active sessions, and password security settings." 
                        color="bg-emerald-600"
                        
                    />
                    <DashboardCard 
                        icon={<MdSettings size={28}/>} 
                        title="Account Settings" 
                        desc="Configure security keys, connected applications, and general account parameters." 
                        color="bg-indigo-600"
                    />
                    <DashboardCard 
                        icon={<MdHelpOutline size={28}/>} 
                        title="Help & Support" 
                        desc="Access system documentation, submit inquiries, or reach out to support." 
                        color="bg-amber-600"
                    />
                </section>

                {/* Sidebar Activity Panel */}
                <aside className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="bg-slate-800 dark:bg-emerald-800 px-5 py-3.5 flex items-center gap-2 text-white">
                            <MdNotifications size={20} />
                            <span className="font-bold text-sm uppercase tracking-wider">System Activity</span>
                        </div>
                        <div className="p-5 space-y-5">
                            <ActivityItem date="JUST NOW" text="Successful sign-in to account portal." />
                            <ActivityItem date="PREVIOUS" text="Security check passed successfully." />
                            <ActivityItem date="INFO" text="Multi-factor authentication active." />
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800 text-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-center gap-1">
                                <MdHistory size={16} /> All sessions secure
                            </span>
                        </div>
                    </div>
                </aside>

            </main>
        </div>
    );
};

/* Reusable Dashboard Card */
const DashboardCard = ({ icon, title, desc, color, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
        <div className={`${color} w-14 h-14 rounded-xl flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1.5">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
);

/* Reusable Activity Item */
const ActivityItem = ({ date, text }) => (
    <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0">
        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-wider block mb-0.5">{date}</span>
        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-snug">
            {text}
        </p>
    </div>
);

export default Dashboard;