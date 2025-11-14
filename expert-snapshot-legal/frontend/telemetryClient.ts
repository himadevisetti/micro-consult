// telemetryClient.ts

import { ApplicationInsights } from "@microsoft/applicationinsights-web";

const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.APPINSIGHTS_INSTRUMENTATIONKEY || "",
    enableAutoRouteTracking: true,
  },
});

appInsights.loadAppInsights();

export { appInsights };