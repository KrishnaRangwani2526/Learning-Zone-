import { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export type UserRole = "student" | "admin";

interface User {
  email: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const MOCK_USERS = [
  { email: "student@test.com", password: "student123", role: "student" as UserRole, name: "Rahul Sharma" },
  { email: "admin@test.com", password: "admin123", role: "admin" as UserRole, name: "Dr. Priya Singh" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string, role: UserRole): boolean => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password && u.role === role
    );
    if (found) {
      setUser({ email: found.email, role: found.role, name: found.name });
      return true;
    }
    // Allow any credentials for demo
    setUser({ email, role, name: role === "admin" ? "Admin User" : "Student User" });
    return true;
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
