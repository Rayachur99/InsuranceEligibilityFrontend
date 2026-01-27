import React, { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";

type User = {
  role: string;
};

type AuthContextType = {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string) => {
  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT token received");
  }
  sessionStorage.setItem("jwt", token);
  const decoded: any = jwtDecode(token);
  setUser({ role: decoded.role });
};


  const logout = () => {
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;