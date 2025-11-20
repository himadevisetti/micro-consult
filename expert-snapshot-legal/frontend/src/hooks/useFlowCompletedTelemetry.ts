// src/hooks/useFlowCompletedTelemetry.ts

import { useEffect, useRef } from "react";
import { track } from "../../track.js";

export function useFlowCompletedTelemetry({
  flowName,
  fieldCount,
  customerId = "anonymous",
  templateId,
}: {
  flowName: string;
  fieldCount: number;
  customerId?: string;
  templateId?: string;
}) {
  const hasFired = useRef(false);

  useEffect(() => {
    if (!hasFired.current) {
      track("flow_completed", {
        flowName,
        fieldCount,
        customerId,
        ...(templateId && { templateId }),
      });
      hasFired.current = true;
    }
  }, [flowName, fieldCount, customerId, templateId]);
}

