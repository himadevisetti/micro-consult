// src/pages/ForgotPasswordPage.tsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import styles from "../styles/LoginPage.module.css";
import { focusFirstError } from "../utils/focusFirstError";

const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({ email: "" });
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [showBanner, setShowBanner] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setShowBanner(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowBanner(false);

    const newErrors: typeof errors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowBanner(true);
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("If the email exists, a reset link has been sent.");
      } else {
        setStatus(data.error || "Failed to process request.");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Focus first editable field on mount
  useEffect(() => {
    const formEl = document.getElementById("forgotPasswordForm");
    if (!formEl) return;

    const editable = formEl.querySelector(
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])'
    ) as HTMLElement | null;

    editable?.focus();
  }, []);

  // Focus first error field after submit
  useEffect(() => {
    if (!submitted || Object.keys(errors).length === 0) return;

    focusFirstError("forgotPasswordForm", errors as Record<string, string>);
    setSubmitted(false);
  }, [submitted, errors]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        <AppHeader showHomeButton={false} />

        <main className={styles.landing}>
          <h2 className={styles.formTitle}>🔑 Forgot your password?</h2>

          {showBanner && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          {status && <div className={styles.errorBanner}>{status}</div>}

          <div className={styles.cardGroup}>
            <div className={styles.formColumn}>
              <form
                id="forgotPasswordForm"
                onSubmit={handleSubmit}
                style={{ all: "unset", display: "contents" }}
              >
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Email"
                  autoComplete="username"
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <div className={styles.loginFooter}>
                Remembered your password? <a href="/login">Sign in</a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

