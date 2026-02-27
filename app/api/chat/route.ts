import { NextRequest, NextResponse } from "next/server";

const LANGFLOW_URL =
    process.env.LANGFLOW_API_URL ||
    "http://34.56.122.118:3010/api/v1/run/ee71682c-bfc5-4aec-a919-c6373742d5a2";

const LANGFLOW_API_KEY =
    process.env.LANGFLOW_API_KEY ||
    "sk-16rERJrWpzvCnRBSaQoXCzQRx8ojPCspA4IMEAaNr2I";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(LANGFLOW_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": LANGFLOW_API_KEY,
            },
            body: JSON.stringify({
                output_type: "chat",
                input_type: "chat",
                input_value: body.input_value,
                session_id: body.session_id,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Langflow API error:", response.status, errorText);
            return NextResponse.json(
                { error: "Langflow API error", details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Proxy error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
