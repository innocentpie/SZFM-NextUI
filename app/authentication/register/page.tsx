/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from 'react';
import pb from '../PocketBaseClient';
import styles from './KvizoldalLogin.module.css';
import InputField from './Inputfield';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

import { Input } from "@nextui-org/input";
import { Button } from '@nextui-org/button';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = {
        "username": username,
        "email": email,
        "emailVisibility": true,
        "password": password,
        "passwordConfirm": password,
      };
      const record = await pb.collection('users').create(data);
      await login(email, password);
    } catch (err: any) {
      setError('Hiba történt a regisztráció során. Lehet hogy már létezik a felhasználó.');
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
                <p className={styles.welcomeText}>Üdvözölünk</p>
                <h2 className={styles.loginPrompt}>Hozd létre a fiókodat!</h2>
              </header>
              <form className={styles.loginForm} onSubmit={handleRegister}>
                <div className={styles.inputWrapper}>
                  <Input
                    className={styles.inputField}
                    variant='faded'
                    label="Felhasználónév"
                    value={username}
                    isRequired
                    required
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <Input
                    className={styles.inputField}
                    variant='faded'
                    isRequired
                    required
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    className={styles.inputField}
                    variant='faded'
                    isRequired
                    required
                    label="Jelszó"
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
                    {loading ? 'Regisztrálás...' : 'Regisztráció'}
                </Button>
              </form>
              {error && <p className={styles.errorText}>{error}</p>}
              <div className={styles.registerPrompt}>
                Már van fiókod?{' '}
                <a href="/authentication/login" className={styles.registerLink}>
                  Jelentkezz be itt!
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
