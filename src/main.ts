import type { ReportDateRange, PageViewsReport } from "./google-analytics";
import { runPageViewsReport } from "./google-analytics";
import { notifySlack } from "./notifier";

const task = async (): Promise<void> => {
  await runReport({ dateRange: "daily" });
  await runReport({ dateRange: "weekly" });
};

const runReport = async ({ dateRange }: { dateRange: ReportDateRange }) => {
  const pageTitleReport = await runPageViewsReport({
    dateRange,
    dimension: "pageTitle",
  });

  const pageReferrerReport = await runPageViewsReport({
    dateRange,
    dimension: "pageReferrer",
  });

  notifySlack({
    title: `${dateRange} Report`,
    reports: [formatReport(pageTitleReport), formatReport(pageReferrerReport)],
  });
};

const LOCALE = `ja-JP`;
const PAD = ` `;
const SEPARATOR = `${PAD}|${PAD}`;

const formatReport = ({ headers, ...report }: PageViewsReport): string => {
  const records = report.records.map((record): string[] => {
    return record.map((item): string => {
      return typeof item === "number" ? item.toLocaleString(LOCALE) : item;
    });
  });
  const summary = report.summary.map((item): string => {
    return item.toLocaleString(LOCALE);
  });

  const rows: string[] = [];

  const columnWidths = [Math.max(headers[0].length, summary[0].length), Math.max(headers[1].length, summary[1].length)];

  rows.push(
    `${PAD}${headers
      .map((item, index): string => {
        return columnWidths[index] ? item.padStart(columnWidths[index], PAD) : item;
      })
      .join(SEPARATOR)}${PAD}`
  );

  rows.push(
    records
      .map((record): string => {
        return `${PAD}${record
          .map((item, index): string => {
            return columnWidths[index] ? item.padStart(columnWidths[index], PAD) : item;
          })
          .join(SEPARATOR)}${PAD}`;
      })
      .join(`\n`)
  );

  rows.push(
    `${PAD}${summary
      .map((item, index): string => {
        return columnWidths[index] ? item.padStart(columnWidths[index], PAD) : item;
      })
      .join(SEPARATOR)}${PAD}`
  );

  return rows.join(`\n`);
};

task();
