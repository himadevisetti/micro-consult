// src/server/routes/logout.ts

import { Router } from "express";
import { logDebug } from "../../utils/logger.js";
import { track } from "../../../track.js";

const router = Router();

/**
 * GET /logout
 *
 * 🔹 This route complements the stateless JWT middleware in auth.ts.
 *     - auth.ts validates JWTs only; there is no server-side session store.
 *     - All authentication state lives in the browser's localStorage.
 *
 * 🔹 Frontend logout (HomePage.tsx):
 *     - Clears localStorage, sessionStorage and navigates to /login.
 *     - Does not call this route directly, but achieves the same effect.
 *
 * 🔹 Microsoft Front-Channel Logout:
 *     - Azure AD calls this endpoint when the user signs out from Microsoft.
 *     - Since we are stateless, there is no server-side state to clear.
 *     - We simply log the event and redirect to /login.
 *
 * In both cases, the user ends up at the login page.
 */
router.get("/logout", async (req, res) => {
  logDebug("logout.request.received", { source: "frontend-or-azure" });

  await track("user_logged_out", { flowName: "LogoutRoute" });

  // No cookies or server-side sessions to clear in this architecture.
  return res.redirect("/login");
});

export default router;
