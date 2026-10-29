import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:3000";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi tải ứng dụng, kiểm tra token trong localStorage
  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.data.user);
        } else {
          // Token không hợp lệ hoặc đã bị Redis ban
          localStorage.removeItem("accessToken");
          setToken("");
          setUser(null);
        }
      } catch (err) {
        console.error("Lỗi xác thực người dùng:", err);
        localStorage.removeItem("accessToken");
        setToken("");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifyUser();
  }, [token]);

  // Đăng nhập mật khẩu
  async function login(email, password) {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Đăng nhập thất bại.");
    }

    const accessToken = data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(data.data.user);

    return data.data.user;
  }

  // Đăng nhập Google SSO (tự động đăng ký tài khoản vào DB nếu mới)
  async function loginGoogleSSO(email, name, role) {
    const res = await fetch(`${API_URL}/api/auth/sso/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, role }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Đăng nhập SSO thất bại.");
    }

    const accessToken = data.data.accessToken;
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
    setUser(data.data.user);

    return data.data.user;
  }

  // Đăng xuất: Đưa Token vào Redis Blacklist và xóa session
  async function logout() {
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (err) {
      console.warn("Lỗi gọi logout API:", err.message);
    } finally {
      localStorage.removeItem("accessToken");
      setToken("");
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        loginGoogleSSO,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

