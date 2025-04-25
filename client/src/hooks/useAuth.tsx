import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check for stored authentication state on load
  useEffect(() => {
    const authState = localStorage.getItem("isAuthenticated");
    if (authState === "true") {
      setIsAuthenticated(true);
    }
  }, []);
  
  const login = async (password: string): Promise<boolean> => {
    try {
      const response = await apiRequest("POST", "/api/auth", { password });
      const data = await response.json();
      
      const success = !!data.success;
      
      if (success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
      }
      
      return success;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };
  
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("isAuthenticated");
  };
  
  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
