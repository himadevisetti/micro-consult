// src/pages/LoginPage.tsx

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MicrosoftLoginButton } from "../components/Auth/MicrosoftLoginButton";
import AppHeader from "../components/AppHeader";
import styles from "../styles/LoginPage.module.css";
import { focusFirstError } from "../utils/focusFirstError";
import { isAuthenticated } from "@/utils/authToken";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [showBanner, setShowBanner] = useState(false);

  const navigate = useNavigate();

  // 🔹 Auto‑redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // 🔹 Listen for token changes across tabs
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "token" && e.newValue) {
        navigate("/", { replace: true });
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [navigate]);

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
    if (!formData.password.trim()) newErrors.password = "Password is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShowBanner(true);
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // 🔹 Clear any stale navigation flags so forms can't be accessed directly
        sessionStorage.removeItem("formNavigationAllowed");

        setStatus("Login successful! Redirecting...");
        navigate("/");
      } else {
        setStatus(data.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Focus first editable field on mount
  useEffect(() => {
    const formEl = document.getElementById("loginForm");
    if (!formEl) return;

    const editable = formEl.querySelector(
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
    ) as HTMLElement | null;

    editable?.focus();
  }, []);

  // Focus first error field after submit
  useEffect(() => {
    if (!submitted || Object.keys(errors).length === 0) return;

    focusFirstError("loginForm", errors as Record<string, string>);
    setSubmitted(false);
  }, [submitted, errors]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageWrapper}>
        <AppHeader showHomeButton={false} />

        <main className={styles.landing}>
          <h2 className={styles.formTitle}>👤 Sign in to Expert Snapshot Legal</h2>

          {showBanner && (
            <div className={styles.errorBanner}>
              Please fix the highlighted fields below.
            </div>
          )}
          {status && <div className={styles.errorBanner}>{status}</div>}

          <div className={styles.cardGroup}>
            <div className={styles.formColumn}>
              <MicrosoftLoginButton />

              <div className={styles.dividerRow}>
                <hr className={styles.dividerLine} />
                <span className={styles.dividerText}>or</span>
                <hr className={styles.dividerLine} />
              </div>

              <form
                id="loginForm"
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

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.input}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                {errors.password && <span className={styles.error}>{errors.password}</span>}

                <div className={styles.forgotRow}>
                  <a href="/forgot-password" className={styles.forgotLink}>
                    Forgot password?
                  </a>
                </div>

                <button type="submit" className={styles.submitButton} disabled={submitting}>
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className={styles.loginFooter}>
                Don’t have an account? <Link to="/register">Sign up</Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
