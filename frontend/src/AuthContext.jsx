/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Initializing from cookie if present
    const cookieAuth = Cookies.get('isAuthenticated');
    return cookieAuth === 'true' ? true : false;
  });

  const [user, setUser] = useState(() => {
    // Initializing user from cookie if present
    const savedUser = Cookies.get('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // this piece of code checks the value of isAuthenticated and based on that set the cookie value
  // this helps the page to reload the session without being logout
  useEffect(() => {
    if (isAuthenticated) {
      // Set cookie with 5 minutes expiry
      Cookies.set('isAuthenticated', 'true', { path: '/' }); // 1/288 day = 5 minutes
    } else {
      Cookies.remove('isAuthenticated', { path: '/' });
      Cookies.remove('user', { path: '/' });
      setUser(null);
    }
  }, [isAuthenticated]);

  const loginUser = (userData) => {
    setUser(userData);
    Cookies.set('user', JSON.stringify(userData), { path: '/' });
  };

  const logoutUser = () => {
    setUser(null);
    Cookies.remove('user', { path: '/' });
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      setIsAuthenticated, 
      user, 
      loginUser, 
      logoutUser 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
