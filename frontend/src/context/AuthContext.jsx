import React, { createContext, useState, useEffect, useCallback } from 'react';
import jwtDecode from 'jwt-decode';
import { authApi } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('siges_token');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setRole(null);
  }, []);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('siges_token', newToken);
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    setRole(userData.role);
  }, []);

  // Vérifier le token au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('siges_token');
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          // Vérifier expiration
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            setToken(storedToken);
            setIsAuthenticated(true);
            setRole(decoded.role);
            // Récupérer les infos utilisateur fraîches
            const res = await authApi.me();
            setUser(res.data.user);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
