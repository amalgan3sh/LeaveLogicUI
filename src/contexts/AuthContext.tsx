import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'manager' | 'employee';

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const users: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin',
    user: {
      id: '1',
      username: 'admin',
      name: 'Admin User',
      email: 'admin@company.com',
      role: 'admin',
      department: 'Administration',
    },
  },
  manager: {
    password: 'manager',
    user: {
      id: '2',
      username: 'manager',
      name: 'Manager User',
      email: 'manager@company.com',
      role: 'manager',
      department: 'Engineering',
    },
  },
  employee: {
    password: 'employee',
    user: {
      id: '3',
      username: 'employee',
      name: 'Employee User',
      email: 'employee@company.com',
      role: 'employee',
      department: 'Engineering',
    },
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    const userRecord = users[username];
    if (userRecord && userRecord.password === password) {
      setUser(userRecord.user);
      localStorage.setItem('user', JSON.stringify(userRecord.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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
