import fetch from "node-fetch";

import { SLACK_WEBHOOK_URL } from "../env";

type SlackNotifyParams = {
  title: string;
  reports: string[];
};

export const notifySlack = async ({ title, reports }: SlackNotifyParams): Promise<void> => {
  await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      text: `■ ${title}\n${reports
        .map((report) => {
          return `\`\`\`${report}\`\`\``;
        })
        .join(`\n`)}`,
    }),
  });
};
