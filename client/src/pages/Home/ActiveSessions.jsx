import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MdComputer, MdPhoneIphone } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';
import apis from '../../utils/apis';

const ActiveSessions = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSessions = async () => {
        try {
            const response = await axiosInstance.get(apis().getSessions);
            if (response.data.status) {
                setSessions(response.data.sessions);
            }
        } catch (error) {
            toast.error("Failed to load active sessions.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleRevoke = async (sessionId) => {
        try {
            // Send the DELETE request using our dynamic URL
            await axiosInstance.delete(apis().revokeSession(sessionId));
            toast.success("Device logged out securely.");
            
            // Remove the revoked session from the UI immediately
            setSessions(prev => prev.filter(session => session.id !== sessionId));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to log out device.");
        }
    };

    if (isLoading) return <div className="p-10 text-center text-gray-500">Loading security data...</div>;

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-20">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Device History</h2>
            <p className="text-gray-500 mb-6">Review the devices that are currently logged into your account.</p>

            <div className="flex flex-col gap-4">
                {sessions.map((session) => {
                    // Simple logic to guess icon based on user-agent string
                    const isMobile = session.device.toLowerCase().includes('mobi');

                    return (
                        <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                            
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-full text-2xl">
                                    {isMobile ? <MdPhoneIphone /> : <MdComputer />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                                        {session.device.split(' ')[0]} {/* Grabs primary browser/device name */}
                                        {session.isCurrentDevice && (
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                                                This Device
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        IP: {session.ip} • Last active: {new Date(session.loginTime).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            {!session.isCurrentDevice && (
                                <button 
                                    onClick={() => handleRevoke(session.id)}
                                    className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                                >
                                    Log Out Device
                                </button>
                            )}

                        </div>
                    );
                })}
            </div>
            
            {sessions.length === 1 && (
                <p className="text-sm text-center text-gray-400 mt-6">
                    You are only logged in on this device. Your account is secure.
                </p>
            )}
        </div>
    );
};

export default ActiveSessions;