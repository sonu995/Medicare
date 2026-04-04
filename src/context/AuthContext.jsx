import { createContext, useContext, useState, useEffect } from 'react';
import { getUser, getMe, logout as logoutService, isAuthenticated, getToken } from '../api/authService';

const AuthContext = createContext(null);

function decodeToken(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line no-unused-vars
  const login = (userData, _token) => {
    setUser(userData);
  };

  const logout = () => {
    logoutService();
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  useEffect(() => {
    const initAuth = async () => {
      if (isAuthenticated()) {
        // If token is expired, logout immediately
        if (isTokenExpired(getToken())) {
          logout();
          setLoading(false);
          return;
        }
        
        const storedUser = getUser();
        if (storedUser) {
          setUser(storedUser);
        }
        
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            // Server returned error but token may still be valid
            // Keep stored user, but logout only if token invalid
            // If res.success false, maybe token is invalid? We'll logout
            logout();
          }
        } catch (error) {
          // Network error or 401
          if (error.response?.status === 401) {
            // Token is invalid or expired (should have been caught earlier)
            logout();
          } else {
            // Network error, keep stored user (already set)
            console.warn('Failed to fetch user data, using cached profile:', error.message);
            // Do not logout, keep user logged in
          }
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
