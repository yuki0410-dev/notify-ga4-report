import { subDays, format } from "date-fns";

import type { ReportDateRange } from "../";
import { GOOGLE_ANALYTICS_4_PROPERTY_ID } from "../../env";
import { analyticsDataClient, DATE_FORMAT } from "../client";

type PageViewsReportDimension = "pageTitle" | "pageReferrer";

type PageViewsReportParams = {
  dateRange: ReportDateRange;
  dimension: PageViewsReportDimension;
  limit?: number;
};

export type PageViewsReport = {
  headers: ["PV", "Users", PageViewsReportDimension];
  records: [
    number, // screenPageViews
    number, // totalUsers
    string // {dimension}
  ][];
  summary: [
    number, // screenPageViews
    number // totalUsers
  ];
};

export const runPageViewsReport = async ({
  dateRange,
  dimension,
  limit = 10,
}: PageViewsReportParams): Promise<PageViewsReport> => {
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

  console.debug(`bodyResponse: ${JSON.stringify(bodyResponse.rows)}`);

  const records: PageViewsReport["records"] = [];

  const rows = bodyResponse.rows ?? [];
  for (const row of rows) {
    const dimensionValues = row.dimensionValues ?? [];
    const metricValues = row.metricValues ?? [];

    const screenPageViews = Number(metricValues[0]?.value ?? "0");
    const totalUsers = Number(metricValues[1]?.value ?? "0");

    if (records.length < limit) {
      records.push([screenPageViews, totalUsers, dimensionValues[0]?.value || "-"]);
    } else {
      if (!records[limit]) {
        records[limit] = [0, 0, "その他"];
      }
      records[limit][0] = records[limit][0] + screenPageViews;
      records[limit][1] = records[limit][1] + totalUsers;
    }
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

  console.debug(`sumallyResponse: ${JSON.stringify(sumallyResponse.rows)}`);

  const summary: PageViewsReport["summary"] = [
    Number(sumallyResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0"),
    Number(sumallyResponse.rows?.[0]?.metricValues?.[1]?.value ?? "0"),
  ];

  const report: PageViewsReport = {
    headers: ["PV", "Users", dimension],
    records,
    summary,
  };

  console.debug(`report: ${JSON.stringify(report)}`);

  return report;
};
