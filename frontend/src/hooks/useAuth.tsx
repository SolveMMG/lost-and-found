import { createContext, useContext, useState } from "react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string;
  isAdmin: boolean;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.error || "Error", variant: "destructive" });
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast({ title: "Registration successful", description: `Welcome, ${data.user.name || data.user.email}!` });
      return true;
    } catch {
      toast({ title: "Registration error", description: "An error occurred", variant: "destructive" });
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Login failed", description: data.error || "Error", variant: "destructive" });
        return false;
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      toast({ title: "Login successful", description: `Welcome back, ${data.user.name || data.user.email}!` });
      return true;
    } catch {
      toast({ title: "Login error", description: "An error occurred", variant: "destructive" });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    toast({ title: "Logged out", description: "You have been logged out." });
  };

  const isAdmin = user?.isAdmin === true;
  console.log("AuthProvider initialized", { user, token, isAdmin });

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};