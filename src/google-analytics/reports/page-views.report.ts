import { subDays, format } from "date-fns";

import { GOOGLE_ANALYTICS_4_PROPERTY_ID } from "../../env";
import { analyticsDataClient, DATE_FORMAT } from "../client";

type PageViewsReportParams = {
  dateRange: "daily" | "weekly";
  dimension: "pageTitle" | "pageReferrer";
};

type PageViewsReport = {
  headers: string[];
  body: [
    number, // screenPageViews
    number, // totalUsers
    string | null // {dimension}
  ][];
};

export const runPageViewsReport = async ({ dateRange, dimension }: PageViewsReportParams): Promise<PageViewsReport> => {
  const now = new Date();

  const report: PageViewsReport = {
    headers: ["screenPageViews", "totalUsers", dimension],
    body: [],
  };

  const [response] = await analyticsDataClient.runReport({
    property: `properties/${GOOGLE_ANALYTICS_4_PROPERTY_ID}`,
    dateRanges: [
      {
        name: dateRange,
        startDate: format(subDays(now, dateRange === "daily" ? 1 : 7), DATE_FORMAT),
        endDate: format(subDays(now, 1), DATE_FORMAT),
      },
    ],
    dimensions: [
      {
        name: dimension,
      },
    ],
    metrics: [
      {
        name: "screenPageViews",
      },
      {
        name: "totalUsers",
      },
    ],
    orderBys: [
      {
        metric: {
          metricName: "screenPageViews",
        },
        desc: true,
      },
      {
        metric: {
          metricName: "totalUsers",
        },
        desc: true,
      },
    ],
  });

  for (const row of response.rows ?? []) {
    const dimensionValues = row.dimensionValues ?? [];
    const metricValue = row.metricValues ?? [];

    report.body.push([
      Number(metricValue[0]?.value ?? "0"),
      Number(metricValue[1]?.value ?? "0"),
      dimensionValues[0]?.value ?? null,
    ]);
  }

  return report;
};
