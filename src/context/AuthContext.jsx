import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("mailbridge_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(localStorage.getItem("mailbridge_token") || "");
  const [apiKey, setApiKey] = useState(localStorage.getItem("mailbridge_api_key") || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token && !user) {
      fetchProfile();
    }
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setUser(data.user);
      setApiKey(data.apiKey);
      localStorage.setItem("mailbridge_user", JSON.stringify(data.user));
      localStorage.setItem("mailbridge_api_key", data.apiKey);
    } catch (error) {
      logout();
    }
  }

  async function register(email, name, password) {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setToken(data.token);
      setUser(data.user);
      setApiKey(data.apiKey);
      localStorage.setItem("mailbridge_token", data.token);
      localStorage.setItem("mailbridge_user", JSON.stringify(data.user));
      localStorage.setItem("mailbridge_api_key", data.apiKey);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setToken(data.token);
      setUser(data.user);
      setApiKey(data.apiKey);
      localStorage.setItem("mailbridge_token", data.token);
      localStorage.setItem("mailbridge_user", JSON.stringify(data.user));
      localStorage.setItem("mailbridge_api_key", data.apiKey);
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function rotateKey() {
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/rotate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rotate key");
      setApiKey(data.apiKey);
      localStorage.setItem("mailbridge_api_key", data.apiKey);
      return data.apiKey;
    } catch (error) {
      throw error;
    }
  }

  async function updateUserSettings(payload) {
    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");
      const updatedUser = { 
        ...user, 
        templateSettings: data.templateSettings,
        useGlobalTemplateSettings: data.useGlobalTemplateSettings
      };
      setUser(updatedUser);
      localStorage.setItem("mailbridge_user", JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      throw error;
    }
  }

  async function updateApiKeySettings(keyId, newSettings) {
    try {
      const res = await fetch(`http://localhost:5000/api/v1/auth/keys/${keyId}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ templateSettings: newSettings })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update API key settings");
      return data.key;
    } catch (error) {
      throw error;
    }
  }

  function logout() {
    setUser(null);
    setToken("");
    setApiKey("");
    localStorage.removeItem("mailbridge_user");
    localStorage.removeItem("mailbridge_token");
    localStorage.removeItem("mailbridge_api_key");
  }

  return (
    <AuthContext.Provider value={{ user, token, apiKey, setApiKey, loading, register, login, logout, rotateKey, updateUserSettings, updateApiKeySettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
