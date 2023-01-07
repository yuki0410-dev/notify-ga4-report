import { BetaAnalyticsDataClient } from "@google-analytics/data";

import { GOOGLE_APPLICATION_CLIENT_EMAIL, GOOGLE_APPLICATION_PRIVATE_KEY } from "../env";

export type ReportDateRange = "daily" | "weekly";

export const DATE_FORMAT = "yyyy-MM-dd";

export const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: GOOGLE_APPLICATION_CLIENT_EMAIL,
    private_key: GOOGLE_APPLICATION_PRIVATE_KEY,
  },
});
