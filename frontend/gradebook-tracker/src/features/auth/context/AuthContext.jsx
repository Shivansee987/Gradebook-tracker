import { useMemo, useState } from "react";
import { loginRequest, signupRequest } from "../services/authService";
import {
  getStoredToken,
  getStoredUser,
  persistAuth,
  clearAuth,
} from "../utils/authStorage";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());

  const login = async (credentials) => {
    const data = await loginRequest(credentials);
    persistAuth(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    return signupRequest(payload);
  };

  const logout = () => {
    clearAuth();
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout,
    }),
    [token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
