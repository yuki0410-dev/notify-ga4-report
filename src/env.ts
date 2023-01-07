if (!process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID) {
  throw new Error("env.GOOGLE_ANALYTICS_4_PROPERTY_ID is not set");
}

export const GOOGLE_ANALYTICS_4_PROPERTY_ID = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID;

if (!process.env.GOOGLE_APPLICATION_CLIENT_EMAIL) {
  throw new Error("env.GOOGLE_APPLICATION_CLIENT_EMAIL is not set");
}

export const GOOGLE_APPLICATION_CLIENT_EMAIL = process.env.GOOGLE_APPLICATION_CLIENT_EMAIL;

if (!process.env.GOOGLE_APPLICATION_PRIVATE_KEY) {
  throw new Error("env.GOOGLE_APPLICATION_PRIVATE_KEY is not set");
}

export const GOOGLE_APPLICATION_PRIVATE_KEY = process.env.GOOGLE_APPLICATION_PRIVATE_KEY;

if (!process.env.SLACK_WEBHOOK_URL) {
  throw new Error("env.SLACK_WEBHOOK_URL is not set");
}

export const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
