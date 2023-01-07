import got from "got";

import { SLACK_WEBHOOK_URL } from "../env";

type SlackNotifyParams = {
  title: string;
  reports: string[];
};

export const notifySlack = async ({ title, reports }: SlackNotifyParams): Promise<void> => {
  await got.post(SLACK_WEBHOOK_URL, {
    json: {
      text: `■ ${title}\n${reports
        .map((report) => {
          return `\`\`\`${report}\`\`\``;
        })
        .join(`\n`)}`,
    },
  });
};
