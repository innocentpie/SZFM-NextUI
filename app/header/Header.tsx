'use client';

import React, { useState } from 'react';
import styles from './Header.module.css';
import { RivetIconsMagnifyingGlass, TablerPlus } from '../assets/SvgIcons';
import { useAuth } from '../authentication/AuthContext';
import { Button } from '@nextui-org/button';

const Header: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Kijelentkezési hiba:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className={styles.header}>
      <nav className={styles.navigation}>
      <Button color="primary" className={styles.searchButton}>
        <span>Keresés</span>
        <RivetIconsMagnifyingGlass className={styles.icon} />
      </Button>
      <Button className={styles.createButton}>
        <span>Létrehozás</span>
        <TablerPlus className={styles.icon2} />
      </Button>
      </nav>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Kvízoldal</h1>
      </div>
      <img
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/b7076296348a5826de43adb784165cc5e80870da0873c21ccdd3996c7794d128"
        alt="Quiz Page Logo"
        className={styles.logo}
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />

      {/* Modal megjelenítése */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Kijelentkezés</h2>
            <p>Biztosan ki szeretnél jelentkezni?</p>
            <div className={styles.modalButtons}>
              <button
                className={styles.logoutButton}
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Kijelentkezés...' : 'Kijelentkezés'}
              </button>
              <button className={styles.cancelButton} onClick={handleCloseModal}>
                Mégsem
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;