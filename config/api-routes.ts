// Langflow agent configuration
export const LANGFLOW_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://34.56.122.118:3010";

export const LANGFLOW_FLOW_ID =
    process.env.NEXT_PUBLIC_FLOW_ID ||
    "d83ca19c-6ef1-4a1b-a8cd-d4f83c496e91";

export const AGENT_KEY =
    process.env.NEXT_PUBLIC_AGENT_KEY ||
    "sk-16rERJrWpzvCnRBSaQoXCzQRx8ojPCspA4IMEAaNr2I";

export const BASE_BOT_URL = `${LANGFLOW_BASE_URL}/api/v1/run/${LANGFLOW_FLOW_ID}`;

export const API_URL_QUERY = {
    SEND_QUERY: BASE_BOT_URL,
    AGENT_KEY: AGENT_KEY,
};

