import { subDays, format } from "date-fns";

import { GOOGLE_ANALYTICS_4_PROPERTY_ID } from "../../env";
import type { ReportDateRange } from "../client";
import { analyticsDataClient, DATE_FORMAT } from "../client";

type PageViewsReportDimension = "pageTitle" | "pageReferrer";

type PageViewsReportParams = {
  dateRange: ReportDateRange;
  dimension: PageViewsReportDimension;
};

type PageViewsReport = {
  headers: ["screenPageViews", "totalUsers", PageViewsReportDimension];
  body: [
    number, // screenPageViews
    number, // totalUsers
    string | null // {dimension}
  ][];
  summary: [
    number, // screenPageViews
    number // totalUsers
  ];
};

export const runPageViewsReport = async ({ dateRange, dimension }: PageViewsReportParams): Promise<PageViewsReport> => {
  const now = new Date();

  // body
  const [bodyResponse] = await analyticsDataClient.runReport({
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

  const body: PageViewsReport["body"] = [];

  for (const row of bodyResponse.rows ?? []) {
    const dimensionValues = row.dimensionValues ?? [];
    const metricValues = row.metricValues ?? [];

    body.push([
      Number(metricValues[0]?.value ?? "0"),
      Number(metricValues[1]?.value ?? "0"),
      dimensionValues[0]?.value ?? null,
    ]);
  }

  // sumally
  const [sumallyResponse] = await analyticsDataClient.runReport({
    property: `properties/${GOOGLE_ANALYTICS_4_PROPERTY_ID}`,
    dateRanges: [
      {
        name: dateRange,
        startDate: format(subDays(now, dateRange === "daily" ? 1 : 7), DATE_FORMAT),
        endDate: format(subDays(now, 1), DATE_FORMAT),
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
  });

  console.log(JSON.stringify(sumallyResponse.rows));

  const summary: PageViewsReport["summary"] = [
    Number(sumallyResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0"),
    Number(sumallyResponse.rows?.[0]?.metricValues?.[1]?.value ?? "0"),
  ];

  return {
    headers: ["screenPageViews", "totalUsers", dimension],
    body,
    summary,
  };
};
