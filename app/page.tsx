'use client';

import React, { useEffect } from 'react';
import { useAuth } from './authentication/AuthContext';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/quiz');
      } else {
        router.push('/authentication/login');
      }
    }
  }, [user, loading, router]);
  return <h1><p>Betöltés...</p></h1>;
};

export default HomePage;
