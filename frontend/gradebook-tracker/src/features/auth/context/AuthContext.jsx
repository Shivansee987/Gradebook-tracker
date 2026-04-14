import { useEffect, useMemo, useRef, useState } from "react";
import { loginRequest, signupRequest } from "../services/authService";
import {
  getStoredToken,
  getStoredUser,
  persistAuth,
  clearAuth,
} from "../utils/authStorage";
import { getTokenExpiryMs, isTokenExpired } from "../utils/tokenUtils";
import { AuthContext } from "./authContext";
import { useToast } from "../../../shared/toast/useToast";

export function AuthProvider({ children }) {
  const { pushToast } = useToast();
  const logoutTimerRef = useRef(null);

  const [token, setToken] = useState(() => {
    const storedToken = getStoredToken();
    return isTokenExpired(storedToken) ? "" : storedToken;
  });
  const [user, setUser] = useState(() => {
    const storedToken = getStoredToken();
    if (isTokenExpired(storedToken)) {
      clearAuth();
      return null;
    }
    return getStoredUser();
  });

  const login = async (credentials) => {
    const data = await loginRequest(credentials);

    // Refuse to persist tokens that are already expired/malformed.
    if (isTokenExpired(data.access_token)) {
      throw new Error("Received an invalid session token. Please try again.");
    }

    persistAuth(data.access_token, data.user);
    setToken(data.access_token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    return signupRequest(payload);
  };

  const logout = () => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    clearAuth();
    setToken("");
    setUser(null);
  };

  useEffect(() => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    if (!token) {
      return;
    }

    const expiryMs = getTokenExpiryMs(token);
    if (!expiryMs) {
      logoutTimerRef.current = window.setTimeout(() => {
        logout();
        pushToast({
          type: "error",
          title: "Session ended",
          message: "Your session token was invalid. Please sign in again.",
        });
      }, 0);
      return;
    }

    const timeoutMs = expiryMs - Date.now();
    if (timeoutMs <= 0) {
      logoutTimerRef.current = window.setTimeout(() => {
        logout();
        pushToast({
          type: "info",
          title: "Session expired",
          message: "Please sign in again to continue.",
        });
      }, 0);
      return;
    }

    // Schedule auto-logout exactly when token expires to keep client state secure.
    logoutTimerRef.current = window.setTimeout(() => {
      logout();
      pushToast({
        type: "info",
        title: "Session expired",
        message: "You were logged out automatically for security.",
      });
    }, timeoutMs);

    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = null;
      }
    };
  }, [token, pushToast]);

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
