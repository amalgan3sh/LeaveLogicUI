import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { loginApi } from '../services/authService';

export type UserRole = 'admin' | 'manager' | 'employee' | 'Manager' | 'Employee';

export interface User {
  id: string | number;
  username?: string;
  name?: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  token?: string;
  fullName?: string;
  employeeCode?: string;
}

interface AuthContextType {
  user: User | null;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; redirectPath?: string; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; redirectPath?: string; error?: string }> => {
    // Admin login remains local
    if (usernameOrEmail === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: '1',
        username: 'admin',
        name: 'Admin User',
        email: 'admin@company.com',
        role: 'admin',
        department: 'Administration',
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      return { success: true, redirectPath: '/admin' };
    }

    // Allow test login for manager
    if (usernameOrEmail === 'manager' && password === 'manager') {
      const managerUser: User = {
        id: '2',
        username: 'manager',
        name: 'Manager User',
        email: 'manager@company.com',
        role: 'manager',
        department: 'Management',
      };
      setUser(managerUser);
      localStorage.setItem('user', JSON.stringify(managerUser));
      return { success: true, redirectPath: '/manager' };
    }

    // Allow test login for employee
    if (usernameOrEmail === 'employee' && password === 'employee') {
      const employeeUser: User = {
        id: '3',
        username: 'employee',
        name: 'Employee User',
        email: 'employee@company.com',
        role: 'employee',
        department: 'Engineering',
      };
      setUser(employeeUser);
      localStorage.setItem('user', JSON.stringify(employeeUser));
      return { success: true, redirectPath: '/employee' };
    }

    // For real manager/employee, use real API
    try {
      const res = await loginApi(usernameOrEmail, password);
      // Store token and user in localStorage
      const userObj: User = {
        id: res.employee?.id || '',
        email: res.employee?.email || usernameOrEmail,
        role: res.role,
        name: res.employee?.fullName || res.employee?.firstName || '',
        fullName: res.employee?.fullName,
        employeeCode: res.employee?.employeeCode,
        department: res.employee?.department,
        token: res.token,
      };
      setUser(userObj);
      localStorage.setItem('user', JSON.stringify(userObj));
      localStorage.setItem('token', res.token);
      return { success: true, redirectPath: res.redirectPath };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
