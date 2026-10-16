import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    MdLogout, MdNotificationsActive, MdOutlineSchool, 
    MdEvent, MdAssignment, MdSecurity, MdOutlineLightMode, MdOutlineDarkMode 
} from 'react-icons/md';
import apis, { secureFetch } from '../../utils/apis';
import { ThemeContext } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const StudentHomePage = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [studentData, setStudentData] = useState({ email: '', role: '' });

    const { logout } = useAuth();

    // Fetch user data on load
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await secureFetch(apis().checkAuth, { method: 'GET' });
                const result = await res.json();
                if (res.ok && result?.status) {
                    setStudentData({ 
                        email: result.email || 'Scholar', 
                        role: result.role || 'student' 
                    });
                }
            } catch (err) {
                console.error("Auth check failed");
            }
        };
        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await logout(); // Calls the centralized context logout method
    };

    // const handleLogout = async () => {
        // try {
        //     // 1. Use secureFetch to safely bypass any Axios interceptor crashes
        //     await secureFetch(apis().logoutUser, { method: "POST" });
        // } catch (error) {
        //     console.error("Backend logout error, forcing local cleanup", error);
        // } finally {
        //     // 2. ALWAYS destroy the local session
        //     localStorage.removeItem('accessToken');
            
        //     // 3. Show notification
        //     toast.success("Logged out successfully");
            
        //     // 4. Smooth SPA redirect instead of hard window reload
        //     navigate('/login', { replace: true });
        // }

        
    // };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            
            <nav className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                <MdOutlineSchool size={26} />
                            </div>
                            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter uppercase">
                                ACADEMIC <span className="text-blue-600">PORTAL</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={toggleTheme}
                                title="Toggle Theme"
                                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 hover:ring-2 hover:ring-blue-400 transition-all duration-200 cursor-pointer"
                            >
                                {theme === 'light' ? <MdOutlineDarkMode size={20}/> : <MdOutlineLightMode size={20}/>}
                            </button>

                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 dark:bg-rose-900/20 text-red-600 dark:text-rose-400 font-bold rounded-xl hover:bg-red-600 hover:text-white dark:hover:bg-rose-600 dark:hover:text-white transition-all duration-300 border border-rose-100 dark:border-rose-900/30 cursor-pointer"
                            >
                                <span className="hidden sm:inline">Sign Out</span>
                                <MdLogout size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="bg-blue-700 dark:bg-blue-900 py-14 transition-colors">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">
                            Welcome Back!
                        </h1>
                        <p className="text-blue-100 text-lg font-medium opacity-90 italic">
                            "{studentData.email}"
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-5 rounded-2xl border border-white/20 shadow-2xl">
                        <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl uppercase">
                            {studentData.email.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs uppercase text-blue-200 font-bold tracking-widest">Account Type</p>
                            <p className="text-white font-bold text-lg capitalize">{studentData.role}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
                
                <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <DashboardCard 
                        icon={<MdAssignment size={32}/>} 
                        title="Assignments" 
                        desc="Submit your homework and view grading feedback." 
                        color="bg-indigo-500"
                    />
                    <DashboardCard 
                        icon={<MdEvent size={32}/>} 
                        title="Class Timetable" 
                        desc="View your weekly lecture schedule and room numbers." 
                        color="bg-sky-500"
                    />
                    <DashboardCard 
                        icon={<MdSecurity size={32}/>} 
                        title="Security & Sessions" 
                        desc="Monitor your active devices and login history." 
                        color="bg-emerald-600"
                        onClick={() => navigate('/student/sessions')}
                    />
                    <DashboardCard 
                        icon={<MdNotificationsActive size={32}/>} 
                        title="Circulars" 
                        desc="Official announcements from the administration." 
                        color="bg-amber-500"
                    />
                </section>

                <aside className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="bg-slate-800 dark:bg-blue-600 px-6 py-4 flex items-center gap-2 text-white">
                            <MdNotificationsActive className="animate-bounce" />
                            <span className="font-black uppercase tracking-tighter">Notice Board</span>
                        </div>
                        <div className="p-6 space-y-6">
                            <NoticeItem date="MAY 14" text="Summer break starts from next week." />
                            <NoticeItem date="MAY 18" text="Submission deadline for Science project." />
                            <NoticeItem date="MAY 22" text="New library timings updated in portal." />
                        </div>
                        <button className="w-full py-4 text-sm text-blue-600 dark:text-blue-400 font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t dark:border-slate-800 cursor-pointer">
                            View All History
                        </button>
                    </div>
                </aside>

            </main>
        </div>
    );
};

const DashboardCard = ({ icon, title, desc, color, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group"
    >
        <div className={`${color} w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
);

const NoticeItem = ({ date, text }) => (
    <div className="group">
        <span className="text-[11px] font-black text-blue-600 dark:text-blue-400 tracking-widest block mb-1">{date}</span>
        <p className="text-sm text-slate-700 dark:text-slate-300 font-bold leading-tight group-hover:text-blue-600 transition-colors cursor-pointer">
            {text}
        </p>
    </div>
);

export default StudentHomePage;