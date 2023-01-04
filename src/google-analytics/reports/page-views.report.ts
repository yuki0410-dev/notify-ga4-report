import { subDays, format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

import type { ReportDateRange } from "../";
import { GOOGLE_ANALYTICS_4_PROPERTY_ID } from "../../env";
import { analyticsDataClient, DATE_FORMAT } from "../client";

type PageViewsReportParams = {
  dateRange: ReportDateRange;
};

type Report = {
  name: string;
  records: {
    dimension: string;
    pageViews: number;
  }[];
};

export type PageViewsReport = {
  dateRange: {
    name: ReportDateRange;
    startDate: string;
    endDate: string;
  };
  total: {
    pageViews: number;
    users: number;
  };
  reports: Report[];
};

const LIMIT = 10;

export const runPageViewsReport = async ({ dateRange }: PageViewsReportParams): Promise<PageViewsReport> => {
  const baseDate = subDays(new Date(), 1);

  const dateRanges: PageViewsReport["dateRange"][] = [
    {
      name: dateRange,
      ...(dateRange === "daily"
        ? {
            startDate: format(startOfDay(baseDate), DATE_FORMAT),
            endDate: format(endOfDay(baseDate), DATE_FORMAT),
          }
        : dateRange === "weekly"
        ? {
            startDate: format(startOfWeek(baseDate), DATE_FORMAT),
            endDate: format(endOfWeek(baseDate), DATE_FORMAT),
          }
        : {
            startDate: format(startOfMonth(baseDate), DATE_FORMAT),
            endDate: format(endOfMonth(baseDate), DATE_FORMAT),
          }),
    },
  ];

  const metrics = [
    {
      name: "screenPageViews",
    },
  ];

  const orderBys = [
    {
      metric: {
        metricName: "screenPageViews",
      },
      desc: true,
    },
  ];

  // pageTitle
  const [pageTitleResponse] = await analyticsDataClient.runReport({
    property: `properties/${GOOGLE_ANALYTICS_4_PROPERTY_ID}`,
    dateRanges,
    dimensions: [
      {
        name: "pageTitle",
      },
    ],
    metrics,
    orderBys,
  });

  console.debug(`pageTitleResponse: ${JSON.stringify(pageTitleResponse.rows)}`);

  const pageTitleReport: Report = {
    name: "Page Title",
    records: [],
  };

  for (const row of pageTitleResponse.rows ?? []) {
    const dimensionValues = row.dimensionValues ?? [];
    const metricValues = row.metricValues ?? [];

    const screenPageViews = Number(metricValues[0]?.value ?? "0");

    if (pageTitleReport.records.length < LIMIT) {
      pageTitleReport.records.push({
        dimension: dimensionValues[0]?.value || "-",
        pageViews: screenPageViews,
      });
    } else {
      if (!pageTitleReport.records[LIMIT]) {
        pageTitleReport.records[LIMIT] = { dimension: "その他", pageViews: 0 };
      }
      pageTitleReport.records[LIMIT].pageViews = pageTitleReport.records[LIMIT].pageViews + screenPageViews;
    }
  }

  // pageReferrer

  const [pageReferrerResponse] = await analyticsDataClient.runReport({
    property: `properties/${GOOGLE_ANALYTICS_4_PROPERTY_ID}`,
    dateRanges,
    dimensions: [
      {
        name: "pageReferrer",
      },
    ],
    metrics,
    orderBys,
  });

  console.debug(`pageReferrerResponse: ${JSON.stringify(pageReferrerResponse.rows)}`);

  const pageReferrerReport: Report = {
    name: "Referrer",
    records: [],
  };

  for (const row of pageReferrerResponse.rows ?? []) {
    const dimensionValues = row.dimensionValues ?? [];
    const metricValues = row.metricValues ?? [];

    const screenPageViews = Number(metricValues[0]?.value ?? "0");

    if (pageReferrerReport.records.length < LIMIT) {
      pageReferrerReport.records.push({
        dimension: dimensionValues[0]?.value || "-",
        pageViews: screenPageViews,
      });
    } else {
      if (!pageReferrerReport.records[LIMIT]) {
        pageReferrerReport.records[LIMIT] = { dimension: "その他", pageViews: 0 };
      }
      pageReferrerReport.records[LIMIT].pageViews = pageReferrerReport.records[LIMIT].pageViews + screenPageViews;
    }
  }

  // total
  const [totalResponse] = await analyticsDataClient.runReport({
    property: `properties/${GOOGLE_ANALYTICS_4_PROPERTY_ID}`,
    dateRanges,
    metrics: [
      {
        name: "screenPageViews",
      },
      {
        name: "totalUsers",
      },
    ],
  });

  console.debug(`totalResponse: ${JSON.stringify(totalResponse.rows)}`);

  const total: PageViewsReport["total"] = {
    pageViews: Number(totalResponse.rows?.[0]?.metricValues?.[0]?.value ?? "0"),
    users: Number(totalResponse.rows?.[0]?.metricValues?.[1]?.value ?? "0"),
  };

  //
  const report: PageViewsReport = {
    dateRange: dateRanges[0],
    reports: [pageTitleReport, pageReferrerReport],
    total,
  };

  console.debug(`report: ${JSON.stringify(report)}`);

  return report;
};
