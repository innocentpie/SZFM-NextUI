'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import pb from './PocketBaseClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (pb.authStore.isValid) {
        try {
          const authData = await pb.collection('users').authRefresh();
          setUser(authData.record);
        } catch (error) {
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password);
      //süteben tárolja el a hozzáférési tokent
      document.cookie = `pb_token=${authData.token}; path=/; max-age=3600; SameSite=Strict; Secure`;
      setUser(authData.record);
      router.push('/quiz');
    } catch (error) {
      throw new Error('Hibás felhasználónév vagy jelszó');
    }
  };

  const logout = () => {
    pb.authStore.clear();
    document.cookie = 'pb_token=; path=/; max-age=0; SameSite=Strict; Secure';
    setUser(null);
    router.push('/authentication/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
