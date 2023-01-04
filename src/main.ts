import { runPageViewsReport } from "./google-analytics";

const task = async (): Promise<void> => {
  const weeklyReport = await runPageViewsReport({
    dateRange: "weekly",
    dimension: "pageTitle",
  });

  const dailyReport = await runPageViewsReport({
    dateRange: "daily",
    dimension: "pageTitle",
  });

  console.log("Report result:");
  console.log(`weeklyReport: ${JSON.stringify(weeklyReport)}`);
  console.log(`dailyReport: ${JSON.stringify(dailyReport)}`);
};

task();
