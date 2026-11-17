
import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('ticketmaster_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.getMe();
        setUser(response.user);
      } catch (error) {
        localStorage.removeItem('ticketmaster_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, []);

  const register = async (userData) => {
    const response = await api.register(userData);

    localStorage.setItem('ticketmaster_token', response.token);
    setUser(response.user);

    return response;
  };

  const login = async (credentials) => {
    const response = await api.login(credentials);

    localStorage.setItem('ticketmaster_token', response.token);
    setUser(response.user);

    return response;
  };

  const logout = () => {
    localStorage.removeItem('ticketmaster_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};
