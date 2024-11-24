'use client';

import React, { useState } from 'react';
import pb from '../PocketBaseClient';
import styles from './KvizoldalRegister.module.css';
import { useAuth } from '../AuthContext';
import { Input } from "@nextui-org/input";
import { Button } from '@nextui-org/button';
import { EyeSlashFilledIcon } from '@/components/EyeSlashFilledIcon';
import { EyeFilledIcon } from '@/components/EyeFilledIcon';

const RegisterPage: React.FC = () => {
  let emailInputElement = React.createRef<HTMLInputElement>();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [emailValue, setEmailValue] = React.useState("");

  const validateEmail = (value: string) => value.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);

  const isInvalid = React.useMemo(() => {
    if (emailValue === "") return false;

    return validateEmail(emailValue) ? false : true;
  }, [emailValue]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if(!validateEmail(email))
      {
        emailInputElement.current?.focus(); 
        return;
      }

      const data = {
        "username": username,
        "email": email,
        "emailVisibility": true,
        "password": password,
        "passwordConfirm": password,
        "profile_picture": "avatar1",
      };
      await pb.collection('users').create(data);
      await login(email, password);
    } catch (err: any) {
      setError('Hiba történt a regisztráció során. Lehet hogy már létezik a felhasználó.');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.loginContainer}>
      <div className={styles.contentWrapper}>
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
                    className="inputField inputFieldTopM"
                    variant='faded'
                    isRequired
                    required
                    label="Email"
                    ref={emailInputElement}
                    value={email}
                    isInvalid={isInvalid}
                    color={isInvalid ? "danger" : "default"}
                    errorMessage="Kérjük érvényes emailt adjon meg"
                    onValueChange={setEmailValue}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Input
                    className={styles.inputField}
                    variant='faded'
                    isRequired
                    required
                    label="Jelszó"
                    value={password}
                    endContent={
                      <button className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
                        {isVisible ? (
                          <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        ) : (
                          <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
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
