import { Router } from "express";

const router = Router();

router.get("/config.json", (_, res) => {
  const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || "";
  const instrumentationKey = process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "";

  res.json({
    APPLICATIONINSIGHTS_CONNECTION_STRING: connectionString,
    APPINSIGHTS_INSTRUMENTATIONKEY: instrumentationKey,
  });
});

export default router;
