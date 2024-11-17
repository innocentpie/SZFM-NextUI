'use client';

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import styles from './KvizoldalLogin.module.css';
import InputField from './Inputfield';

import { Input } from "@nextui-org/input";
import { Button } from '@nextui-org/button';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Hiba történt a bejelentkezés során.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <main className={styles.loginContainer}>
      <div className={styles.contentWrapper}>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/bb0f45de091b24acb03b613b24d1467fed7e95a923c31f3dd5ac28a8ccb8d09b?placeholderIfAbsent=true&apiKey=1654bbdc21cd4e3d8ecec46f24c8e6ed"
          className={styles.backgroundImage}
          alt="Background"
        />
        <div className={styles.loginFormWrapper}>
          <h1 className={styles.pageTitle}>Kvízoldal</h1>
          <section className={styles.formSection}>
            <div className={styles.formContent}>
              <header className={styles.formHeader}>
                <div className={styles.welcomeText}>Üdv újra</div>
                <h2 className={styles.loginPrompt}>Jelentkezz be!</h2>
              </header>
              <form className={styles.loginForm} onSubmit={handleLogin}>
                <div className={styles.inputWrapper}>
                  <Input
                    className={styles.inputField}
                    isRequired
                    required
                    variant='faded'
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    className={styles.inputField}
                    isRequired
                    required
                    label="Jelszó"
                    variant='faded'
                    value={password}
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                  />

                </div>
                <Button 
                  type="submit" 
                  className={styles.submitButton} 
                  disabled={loading}
                  isLoading={loading}
                  size='lg'
                  color='primary'>
                    {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
                </Button>
                <div className={styles.errorText}>{error && <span>{error}</span>}</div>
              </form>
              <div className={styles.registerPrompt}>
                Új felhasználó?{' '}
                <a href="/authentication/register" className={styles.registerLink}>
                  Regisztrálj itt!
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
