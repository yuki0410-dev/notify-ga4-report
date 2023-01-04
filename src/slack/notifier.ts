import fetch from "node-fetch";

import { SLACK_WEBHOOK_URL } from "../env";
import type { PageViewsReport } from "../google-analytics";

type SlackNotifyParams = {
  report: PageViewsReport;
};

const LOCALE = `ja-JP`;
const CODE_BLOCK = `\`\`\``;

export const notifySlack = async ({ report }: SlackNotifyParams): Promise<void> => {
  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `> *${report.dateRange.name} report : ${report.dateRange.startDate} - ${report.dateRange.endDate}*`,
          },
        },
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [`*PageViews*`, `${CODE_BLOCK}${report.total.pageViews}${CODE_BLOCK}`].join(`\n`),
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: [`*Users*`, `${CODE_BLOCK}${report.total.users}${CODE_BLOCK}`].join(`\n`),
          },
        },
        ...report.reports.map((report) => {
          return {
            type: "section",
            text: {
              type: "mrkdwn",
              text: [
                `*${report.name}*`,
                `${CODE_BLOCK}${report.records
                  .map((record) => {
                    return ` ${record.pageViews.toLocaleString(LOCALE)} ${record.dimension}`;
                  })
                  .join(`\n`)}${CODE_BLOCK}`,
              ].join(`\n`),
            },
          };
        }),
      ],
    }),
  });
};
