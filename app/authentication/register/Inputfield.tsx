import React from 'react';
import styles from './KvizoldalLogin.module.css';
import Image from 'next/image';

interface InputFieldProps {
  label: string;
  value: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, value, type = 'text', onChange }) => (
  <div className={type === 'password' ? styles.passwordField : styles.inputField}>
    <label className={type === 'password' ? styles.passwordLabel : styles.inputLabel}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={styles.inputValue}
      aria-label={label}
      placeholder={type === 'password' ? '********' : label}
    />
    {type === 'password' && (
      <Image
        loading="lazy"
        src={require("@/app/assets/images/eye.png").default}
        className={styles.visibilityIcon}
        alt=""
      />
    )}
  </div>
);

export default InputField;