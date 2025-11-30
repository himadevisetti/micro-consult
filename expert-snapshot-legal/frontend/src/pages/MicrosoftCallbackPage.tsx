// src/pages/MicrosoftCallbackPage.tsx

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logDebug, logWarn } from "@/utils/logger";

export default function MicrosoftCallbackPage() {
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      logWarn("MicrosoftCallbackPage.error.missingToken");
      navigate("/login?error=MissingToken", { replace: true });
      return;
    }

    sessionStorage.setItem("token", token);
    logDebug("MicrosoftCallbackPage.success.tokenStored");
    navigate("/", { replace: true });
  }, [navigate]);

  return <div>Signing you in with Microsoft…</div>;
}
