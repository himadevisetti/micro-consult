// src/pages/ResetPasswordPage.tsx

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import styles from "../styles/LoginPage.module.css";
import { focusFirstError } from "../utils/focusFirstError";

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({ newPassword: "", confirmPassword: "" });
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [showBanner, setShowBanner] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

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
    if (!formData.newPassword.trim()) newErrors.newPassword = "New password is required.";
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = "Confirm password is required.";
    if (formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowBanner(true);
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: formData.newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setStatus(data.error || "Failed to reset password.");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Focus first editable field on mount
  useEffect(() => {
    const formEl = document.getElementById("resetPasswordForm");
    if (!formEl) return;

    const editable = formEl.querySelector(
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"])'
    ) as HTMLElement | null;

    editable?.focus();
  }, []);

  // Focus first error field after submit
  useEffect(() => {
    if (!submitted || Object.keys(errors).length === 0) return;

    focusFirstError("resetPasswordForm", errors as Record<string, string>);
    setSubmitted(false);
  }, [submitted, errors]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        <AppHeader showHomeButton={false} />

        <main className={styles.landing}>
          <h2 className={styles.formTitle}>🔒 Reset your password</h2>

          {showBanner && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          {status && <div className={styles.errorBanner}>{status}</div>}

          <div className={styles.cardGroup}>
            <div className={styles.formColumn}>
              <form
                id="resetPasswordForm"
                onSubmit={handleSubmit}
                style={{ all: "unset", display: "contents" }}
              >
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="New Password"
                  autoComplete="new-password"
                />
                {errors.newPassword && <span className={styles.error}>{errors.newPassword}</span>}

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Confirm Password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

