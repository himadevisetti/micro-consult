// src/components/Auth/MicrosoftLoginButton.tsx

import { useState } from "react";
import styles from "../../styles/LoginPage.module.css";

export const MicrosoftLoginButton = () => {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // 🔹 Kick off Microsoft OAuth via backend route
    window.location.href = "/api/login/microsoft";
  };

  return (
    <button
      className={styles.microsoftButton}
      style={{
        width: "320px",
        backgroundColor: hover ? "var(--soft-blue-hover)" : "var(--soft-blue)",
        borderRadius: "4px",
        border: "1px solid var(--border-default)",
        outline: "none",
        cursor: loading ? "default" : "pointer",
        transition: "background-color 0.3s ease",
        boxShadow: focus ? "0 0 0 2px var(--soft-blue-focus)" : "none",
        opacity: loading ? 0.7 : 1,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onClick={handleClick}
      disabled={loading}
    >
      <span className={styles.microsoftContent}>
        <img
          src="/icons/microsoft.svg"
          alt="Microsoft"
          className={styles.microsoftIcon}
        />
        <span className={styles.microsoftLabel}>
          {loading ? "Signing in..." : "Sign in with Microsoft"}
        </span>
        {loading && <span className={styles.spinner}></span>}
      </span>
    </button>
  );
};
