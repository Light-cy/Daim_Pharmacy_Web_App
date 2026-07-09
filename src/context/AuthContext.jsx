import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (adminSession) {
      setIsAdmin(true);
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    localStorage.setItem('adminSession', JSON.stringify(userData));
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem('adminSession');
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
