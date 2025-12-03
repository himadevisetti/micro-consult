// src/server/routes/microsoftLogin.ts

import express, { Router } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import passport from "passport";
import OAuth2Strategy from "passport-azure-ad-oauth2";
import fetch from "node-fetch";
import { logDebug, logError } from "../../utils/logger.js";
import { track } from "../../../track.js";
import { findOrCreateMicrosoftUser } from "../../models/UserRepository.js";

const router = Router();

// 🔹 Frontend callback URL (env-driven)
const frontendCallbackUrl = process.env.FRONTEND_MICROSOFT_CALLBACK_URL as string;

// 🔹 Configure Microsoft OAuth2 strategy
passport.use(
  new OAuth2Strategy(
    {
      clientID: process.env.AZURE_SIGNIN_CLIENT_ID as string,
      clientSecret: process.env.AZURE_SIGNIN_CLIENT_SECRET as string,
      callbackURL: process.env.AZURE_SIGNIN_REDIRECT_URI as string,
      resource: "https://graph.microsoft.com", // 🔹 Required for Graph token
    } as any,
    async (
      accessToken: string,
      _refreshToken: string,
      params: any,
      profile: any,
      done: (err: any, user?: any) => void
    ) => {
      try {
        // 🔹 Extract access token
        const token = accessToken || params?.access_token;
        if (!token) {
          throw new Error("No access token returned from Microsoft");
        }

        // 🔹 Fetch full profile from Microsoft Graph
        const graphRes = await fetch("https://graph.microsoft.com/v1.0/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const graphProfile = await graphRes.json();

        // 🔹 Structured debug log instead of console.log
        logDebug("microsoftLogin.graphProfile", {
          upn: graphProfile.userPrincipalName,
          mail: graphProfile.mail,
          givenName: graphProfile.givenName,
          surname: graphProfile.surname,
        });

        const email = graphProfile.mail || graphProfile.userPrincipalName;
        if (!email) {
          throw new Error("Microsoft Graph profile missing email/UPN");
        }

        // 🔹 Construct enriched profile for DB lookup
        const enrichedProfile = {
          email,
          upn: graphProfile.userPrincipalName,
          given_name: graphProfile.givenName || "",
          family_name: graphProfile.surname || "",
        };

        // 🔹 Lookup or create user in DB
        const user = await findOrCreateMicrosoftUser(enrichedProfile, params);
        return done(null, user);
      } catch (err) {
        logError("microsoftLogin.strategy.error", { message: String(err) });
        return done(err, null);
      }
    }
  )
);

// 🔹 Route to start Microsoft login (JWT-only, no session)
router.get("/login/microsoft", passport.authenticate("azure_ad_oauth2", { session: false }));

// 🔹 Callback route after Microsoft login (JWT-only, no session)
router.get(
  "/auth/callback/microsoft",
  passport.authenticate("azure_ad_oauth2", { failureRedirect: "/login", session: false }),
  async (req: express.Request & { user?: any }, res) => {
    try {
      const user = req.user;
      if (!user) {
        logError("microsoftLogin.noUser");
        return res.redirect("/login?error=NoUser");
      }

      const options: SignOptions = {
        expiresIn: (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "8h",
      };

      // 🔹 Structured debug log before signing JWT
      logDebug("microsoftLogin.preJWT.user", {
        userId: user?.id,
        customerId: user?.customerId,
        email: user?.email,
        upn: user?.upn,
      });

      const token = jwt.sign(
        {
          userId: user.id,
          customerId: user.customerId,
          email: user.email, // 🔹 include email in JWT payload
          upn: user.upn,     // 🔹 include UPN for guest accounts
        },
        process.env.JWT_SECRET as string,
        options
      );

      logDebug("microsoftLogin.success", {
        userId: user.id,
        customerId: user.customerId,
        email: user.email,
      });

      await track("user_logged_in", {
        flowName: "MicrosoftLoginRoute",
        userId: user.id,
        customerId: user.customerId,
        email: user.email,
      });

      // 🔹 Redirect back to frontend callback page with token
      res.redirect(`${frontendCallbackUrl}?token=${token}`);
    } catch (err) {
      logError("microsoftLogin.error", { message: String(err) });
      res.redirect("/login?error=OAuthFailed");
    }
  }
);

export default router;
