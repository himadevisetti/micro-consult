// src/utils/parseAndValidateRegistrationForm.ts

import { RegistrationFormData, RegistrationFormErrors } from "../types/RegistrationForm";

export function parseAndValidateRegistrationForm(
  data: RegistrationFormData
): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {};

  if (!data.firstName.trim()) errors.firstName = "First name is required";
  if (!data.lastName.trim()) errors.lastName = "Last name is required";
  if (!data.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errors.email = "Invalid email address";

  if (data.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  } else {
    if (!/[A-Z]/.test(data.password)) {
      errors.password = "Password must include at least one uppercase letter";
    } else if (!/[a-z]/.test(data.password)) {
      errors.password = "Password must include at least one lowercase letter";
    } else if (!/[0-9]/.test(data.password)) {
      errors.password = "Password must include at least one number";
    } else if (!/[!@#$%^&*(),.?\":{}|<>]/.test(data.password)) {
      errors.password = "Password must include at least one special character";
    }
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  if (!data.termsAccepted) {
    errors.termsAccepted = "You must agree to the Terms & Conditions";
  }

  return errors;
}
