import { DATE_RANGE } from "./env";
import { runPageViewsReport } from "./google-analytics";
import { notifySlack } from "./slack";

const task = async (): Promise<void> => {
  const report = await runPageViewsReport({
    dateRange: DATE_RANGE,
  });

  notifySlack({
    report,
  });
};

task();
