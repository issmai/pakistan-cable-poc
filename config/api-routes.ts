export const BASE_BOT_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://alara-agents-prod.fintra.ai/api/v1/run/33bc0a25-9d65-4a2a-9d1f-11a921c2c4cf?stream=true";

export const AGENT_KEY = process.env.NEXT_PUBLIC_AGENT_KEY;
export const API_URL_QUERY = {
    SEND_QUERY: BASE_BOT_URL,
    AGENT_KEY: AGENT_KEY,
};
