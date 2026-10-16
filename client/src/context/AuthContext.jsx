import { createContext, useContext, useState, useEffect } from 'react';
import apis, { secureFetch } from '../utils/apis';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // BACK BUTTON & BFCACHE FIX: Actively monitor history navigation and cache restoration
  useEffect(() => {
    const verifySession = () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('accessToken');
      
      // Instantly wipe state if storage was cleared (e.g., via logout on another tab or hitting back)
      if ((!savedUser || !savedToken) && user) {
        setUser(null); 
      } else if (savedUser && !user) {
        setUser(JSON.parse(savedUser));
      }
    };

    // Listeners for back button (popstate), cache restore (pageshow), and cross-tab logout (storage)
    window.addEventListener('popstate', verifySession);
    window.addEventListener('pageshow', (e) => { 
      if (e.persisted) verifySession(); 
    });
    window.addEventListener('storage', verifySession);

    return () => {
      window.removeEventListener('popstate', verifySession);
      window.removeEventListener('pageshow', verifySession);
      window.removeEventListener('storage', verifySession);
    };
  }, [user]);

  const openAuthModal = () => setIsModalOpen(true);
  const closeAuthModal = () => setIsModalOpen(false);

  const logout = async () => {
    try {
      await secureFetch(apis().logoutUser, { method: "POST" });
    } catch (err) {
      console.error("Backend logout error:", err);
    } finally {
      // Clear exact storage keys used across your auth flow
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      
      toast.success("Logged out successfully");
      
      // Hard replace the current history entry to destroy the forward navigation stack
      window.location.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      logout, 
      logoutUser: logout, // Alias for compatibility across components
      isModalOpen, 
      openAuthModal, 
      closeAuthModal, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);