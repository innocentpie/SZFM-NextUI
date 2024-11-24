'use client';
import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';
import { RivetIconsMagnifyingGlass, MdiPlus } from '../assets/SvgIcons';
import { useAuth } from '../authentication/AuthContext';
import { Button } from '@nextui-org/button';
import Image from 'next/image';
import ProfileOptionsModal from '../Modals/ProfileOptionsModal';
import MyQuizzesModal from '../Modals/MyQuizzesModal';
import EditProfileModal from '../Modals/EditProfileModal';
import CreateQuizModal from '../Modals/CreateQuizModal';
import avatarImages from '../assets/avatarImages';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const [isProfileOptionsOpen, setIsProfileOptionsOpen] = useState(false);
  const [isMyQuizzesOpen, setIsMyQuizzesOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isCreateQuizOpen, setIsCreateQuizOpen] = useState(false);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        router.push(`?search=${encodeURIComponent(searchTerm)}`);
      } else {
        router.push(`/quiz`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, router]);

  const handleAvatarClick = () => {
    setIsProfileOptionsOpen(true);
  };

  const handleCreateClick = () => {
    setIsCreateQuizOpen(true);
  };

  const handleCloseProfileOptions = () => {
    setIsProfileOptionsOpen(false);
  };

  const handleSelectOption = (option: 'myQuizzes' | 'editProfile') => {
    if (option === 'myQuizzes') {
      setIsMyQuizzesOpen(true);
    } else if (option === 'editProfile') {
      setIsEditProfileOpen(true);
    }
  };

  const handleCloseMyQuizzes = () => {
    setIsMyQuizzesOpen(false);
  };

  const handleCloseEditProfile = () => {
    setIsEditProfileOpen(false);
  };

  const handleCloseCreateQuiz = () => {
    setIsCreateQuizOpen(false);
  }

  const getAvatar = () => {
    if (user?.profile_picture && avatarImages[user.profile_picture]) {
      return avatarImages[user.profile_picture];
    }
    return "/assets/images/avatar1.png";
  }

  return (
    <header className={styles.header}>
      <nav className={styles.navigation}>
        <div className={styles.inputContainer}>
          <input
            key='default'
            type="email"
            placeholder="Keress kvíz kód vagy kategória alapján..."
            className={styles.customInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <RivetIconsMagnifyingGlass className={styles.icon} />
        </div>
        <Button className={styles.createButton} onClick={handleCreateClick}>
          <span>Létrehozás</span>
          <MdiPlus />
        </Button>
      </nav>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Kvízoldal</h1>
      </div>
      {user && (
        <div className={styles.avatarContainer}>
          <Image
            src={getAvatar()}
            alt="User Avatar"
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer', borderRadius: '50%', border: '0.15rem solid #000', marginRight: '0.5rem' }}
            height={65}
            width={65}
          />
        </div>
      )}

      {/* Create Quiz Modal */}
      <CreateQuizModal
        isOpen={isCreateQuizOpen}
        onClose={handleCloseCreateQuiz}
      />

      {/* Profile Options Modal */}
      <ProfileOptionsModal
        isOpen={isProfileOptionsOpen}
        onClose={handleCloseProfileOptions}
        onSelectOption={handleSelectOption}
      />

      {/* My Quizzes Modal */}
      <MyQuizzesModal
        isOpen={isMyQuizzesOpen}
        onClose={handleCloseMyQuizzes}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={handleCloseEditProfile}
      />
    </header>
  );
};

export default Header;