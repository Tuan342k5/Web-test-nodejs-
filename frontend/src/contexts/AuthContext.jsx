import React, { createContext, useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService.js";
import {
  getStoredToken,
  setStoredToken,
  removeStoredToken,
  isTokenExpired,
} from "../utils/auth.utils.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Xác thực token và lấy profile khi ứng dụng khởi chạy
  const loadUser = useCallback(async () => {
    const currentToken = getStoredToken();
    if (!currentToken || isTokenExpired(currentToken)) {
      removeStoredToken();
      setToken("");
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setError(null);
    } catch (err) {
      console.warn("[AuthContext] Xác thực thất bại hoặc Token bị Redis thu hồi:", err.message);
      removeStoredToken();
      setToken("");
      setUser(null);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Đăng nhập mật khẩu
  const login = async (email, password) => {
    setError(null);
    const data = await authService.login(email, password);
    const accessToken = data.accessToken;

    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(data.user);

    return data.user;
  };

  // Đăng nhập Google SSO
  const loginGoogleSSO = async (payload) => {
    setError(null);
    const data = await authService.loginWithSSO(payload);
    const accessToken = data.accessToken;

    setStoredToken(accessToken);
    setToken(accessToken);
    setUser(data.user);

    return data.user;
  };

  // Đăng xuất: Gọi API thu hồi token vào Redis và dọn localStorage
  const logout = async () => {
    try {
      if (token) {
        await authService.logout();
      }
    } finally {
      removeStoredToken();
      setToken("");
      setUser(null);
      setError(null);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: Boolean(user && token),
    login,
    loginGoogleSSO,
    logout,
    refreshUser: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

