// src/pages/RegistrationPage.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import styles from "../styles/LoginPage.module.css";

import { RegistrationFormData, RegistrationFormErrors } from "../types/RegistrationForm";
import { parseAndValidateRegistrationForm } from "../utils/parseAndValidateRegistrationForm";
import { focusFirstError } from "../utils/focusFirstError";

const RegistrationPage = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<RegistrationFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<null | string>(null);
  const [showBanner, setShowBanner] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setShowBanner(false); // hide banner as user starts fixing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowBanner(false); // reset before validation

    const validationErrors = parseAndValidateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowBanner(true); // show banner only if there are errors
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          termsAccepted: formData.termsAccepted,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("Registration successful! Please check your inbox to verify your email before signing in.");
      } else {
        setStatus(data.error || "Registration failed");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Focus first editable field on mount (dynamic, not hardcoded)
  useEffect(() => {
    const formEl = document.getElementById("registrationForm");
    if (!formEl) return;

    const editable = formEl.querySelector(
      'input:not([type="hidden"]):not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled])'
    ) as HTMLElement | null;

    editable?.focus();
  }, []);

  // Focus first error field after submit
  useEffect(() => {
    if (!submitted || Object.keys(errors).length === 0) return;

    focusFirstError("registrationForm", errors as Record<string, string>);
    setSubmitted(false); // only resets scroll trigger
  }, [submitted, errors]);

  return (
    <div className={styles.pageWrapper}>
      <AppHeader showHomeButton={false} />
      <main className={styles.landing}>

        <h2 className={styles.formTitle}>👤 Create your Expert Snapshot Legal account</h2>

        {showBanner && (
          <div className={styles.errorBanner}>
            Please fix the highlighted fields below.
          </div>
        )}
        {status && <div className={styles.errorBanner}>{status}</div>}

        <div className={styles.cardGroup}>
          <form
            id="registrationForm"
            className={styles.formColumn}
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div className={styles.formRow}>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                autoComplete="given-name"
              />
              {errors.firstName && <span className={styles.error}>{errors.firstName}</span>}
            </div>

            <div className={styles.formRow}>
              <input
                id="lastName"
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                autoComplete="family-name"
              />
              {errors.lastName && <span className={styles.error}>{errors.lastName}</span>}
            </div>

            <div className={styles.formRow}>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className={styles.input}
                autoComplete="username"
              />
              {errors.email && <span className={styles.error}>{errors.email}</span>}
            </div>

            <div className={styles.formRow}>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={styles.input}
                autoComplete="new-password"
              />
              {errors.password && <span className={styles.error}>{errors.password}</span>}
            </div>

            <div className={styles.formRow}>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={styles.input}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <span className={styles.error}>{errors.confirmPassword}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <label style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
                <input
                  id="termsAccepted"
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                />{" "}
                I agree to the Terms & Conditions
              </label>
              {errors.termsAccepted && (
                <span className={styles.error}>{errors.termsAccepted}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <button type="submit" className={styles.submitButton} disabled={submitting}>
                {submitting ? "Registering..." : "Register"}
              </button>
            </div>

            <div className={styles.loginFooter}>
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;
