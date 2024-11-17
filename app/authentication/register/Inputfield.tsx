import React from 'react';
import styles from './KvizoldalLogin.module.css';

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
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/476bad95e9a2e85470dec1f9f590a14ccaf876f8161800d8ee094e0968475731?placeholderIfAbsent=true&apiKey=1654bbdc21cd4e3d8ecec46f24c8e6ed"
        className={styles.visibilityIcon}
        alt=""
      />
    )}
  </div>
);

export default InputField;