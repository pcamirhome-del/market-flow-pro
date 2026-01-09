import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultAdmin: User = {
  id: '1',
  username: 'admin',
  password: 'admin',
  role: 'admin',
  name: 'المدير العام',
  phone: '',
  address: '',
  startDate: new Date().toISOString(),
  permissions: ['all'],
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('marketpro_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Initialize default admin if not exists
    const users = localStorage.getItem('marketpro_users');
    if (!users) {
      localStorage.setItem('marketpro_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    const usersData = localStorage.getItem('marketpro_users');
    const users: User[] = usersData ? JSON.parse(usersData) : [defaultAdmin];
    
    const foundUser = users.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('marketpro_user', JSON.stringify(foundUser));
      return { success: true, message: `مرحباً ${foundUser.name}` };
    }

    return { success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marketpro_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
