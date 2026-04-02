import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
});

// In-memory session store (per server lifetime)
const sessions = new Map<string, OpenAI.Chat.ChatCompletionMessageParam[]>();

const SYSTEM_PROMPT = `You are an AI procurement assistant for Pakistan Cable (PCL), a metals trading and cable manufacturing company.
 
You have access to ALL of the following data — this is the same data shown on the PCL dashboard. Use it to answer any question. Do not say you don't have data if it's listed below.
 
## Global Market Prices (LME & Kitco)
| Metal      | LME ($/MT) | Kitco ($/MT) | Prev Close | Change |
|------------|-----------|--------------|------------|--------|
| Copper     | 9,412     | 9,408        | 9,245      | +1.81% |
| Aluminium  | 2,287     | 2,289        | 2,301      | −0.61% |
| Nickel     | 15,840    | 15,855       | 15,360     | +3.13% |
| Zinc       | 2,741     | 2,738        | 2,774      | −1.19% |
 
## Vendor Pricing Database (Hardcoded — assigned to vendors when they are added)
When a user adds vendors on the dashboard, each vendor is assigned one of the following price profiles (cycling through the list). The "Current Vendor Data" section below shows which vendor got which profile.
 
### Copper Vendor Prices
| Slot | Price ($/MT) | MOQ    | Lead Time | Payment Terms |
|------|-------------|--------|-----------|---------------|
| 1    | 9,280       | 50 MT  | 14 days   | LC 60 days    |
| 2    | 9,350       | 25 MT  | 7 days    | TT Advance    |
| 3    | 9,190       | 100 MT | 21 days   | LC 90 days    |
| 4    | 9,440       | 10 MT  | 5 days    | TT 30 days    |
| 5    | 9,310       | 75 MT  | 18 days   | LC 45 days    |
 
### Aluminium Vendor Prices
| Slot | Price ($/MT) | MOQ     | Lead Time | Payment Terms |
|------|-------------|---------|-----------|---------------|
| 1    | 2,240       | 100 MT  | 10 days   | LC 30 days    |
| 2    | 2,310       | 50 MT   | 7 days    | TT Advance    |
| 3    | 2,195       | 200 MT  | 28 days   | LC 90 days    |
| 4    | 2,275       | 25 MT   | 5 days    | TT 15 days    |
| 5    | 2,260       | 75 MT   | 14 days   | LC 60 days    |
 
### Nickel Vendor Prices
| Slot | Price ($/MT) | MOQ    | Lead Time | Payment Terms |
|------|-------------|--------|-----------|---------------|
| 1    | 15,600      | 20 MT  | 21 days   | LC 60 days    |
| 2    | 15,950      | 10 MT  | 10 days   | TT Advance    |
| 3    | 15,400      | 50 MT  | 30 days   | LC 90 days    |
| 4    | 16,100      | 5 MT   | 7 days    | TT 30 days    |
| 5    | 15,750      | 30 MT  | 14 days   | LC 45 days    |
 
### Zinc Vendor Prices
| Slot | Price ($/MT) | MOQ     | Lead Time | Payment Terms |
|------|-------------|---------|-----------|---------------|
| 1    | 2,700       | 100 MT  | 14 days   | LC 60 days    |
| 2    | 2,770       | 50 MT   | 7 days    | TT Advance    |
| 3    | 2,660       | 200 MT  | 25 days   | LC 90 days    |
| 4    | 2,790       | 25 MT   | 5 days    | TT 15 days    |
| 5    | 2,720       | 75 MT   | 14 days   | LC 45 days    |
 
## Price Forecasts (6-Month, from dashboard charts)
### Copper
| Month    | Forecast | Low    | High   |
|----------|---------|--------|--------|
| Mar '25  | 9,580   | 9,300  | 9,860  |
| Apr '25  | 9,740   | 9,380  | 10,100 |
| May '25  | 9,820   | 9,300  | 10,340 |
| Jun '25  | 9,680   | 9,150  | 10,210 |
| Jul '25  | 9,900   | 9,250  | 10,550 |
 
### Aluminium
| Month    | Forecast | Low    | High   |
|----------|---------|--------|--------|
| Mar '25  | 2,260   | 2,200  | 2,320  |
| Apr '25  | 2,235   | 2,160  | 2,310  |
| May '25  | 2,250   | 2,150  | 2,350  |
| Jun '25  | 2,290   | 2,180  | 2,400  |
| Jul '25  | 2,320   | 2,190  | 2,450  |
 
### Nickel
| Month    | Forecast | Low    | High   |
|----------|---------|--------|--------|
| Mar '25  | 16,100  | 15,200 | 17,000 |
| Apr '25  | 16,400  | 15,000 | 17,800 |
| May '25  | 16,200  | 14,800 | 17,600 |
| Jun '25  | 16,800  | 15,100 | 18,500 |
| Jul '25  | 17,200  | 15,400 | 19,000 |
 
### Zinc
| Month    | Forecast | Low    | High   |
|----------|---------|--------|--------|
| Mar '25  | 2,710   | 2,640  | 2,780  |
| Apr '25  | 2,680   | 2,590  | 2,770  |
| May '25  | 2,700   | 2,580  | 2,820  |
| Jun '25  | 2,730   | 2,600  | 2,860  |
| Jul '25  | 2,760   | 2,610  | 2,910  |
 
## AI Order Timing Recommendations (from dashboard)
- **Copper** — BUY NOW (87% confidence). Price trending +8% over 6 months. 500 MT needed by Mar. Lock in before Q2 surge. Window: Feb–Mar 2025.
- **Aluminium** — WAIT (72% confidence). Forecast dip in Mar–Apr. Defer 6–8 weeks for lower prices. 200 MT needed. Window: Apr 2025.
- **Nickel** — MONITOR (61% confidence). High volatility. Set price alert at $15,500 to trigger buy. 80 MT needed. Window: Mar–Apr 2025.
 
## PCL Procurement Requirements
| Month    | Required (MT) | Recommended Order (MT) |
|----------|--------------|----------------------|
| Mar '25  | 420          | 500                  |
| Apr '25  | 380          | 380                  |
| May '25  | 460          | 180                  |
 
## Your capabilities:
- Compare vendor prices against each other AND against global LME/Kitco prices
- Recommend the best vendor based on price, MOQ, lead time, and payment terms
- Analyze price trends and forecasts and provide procurement timing advice
- Calculate potential savings when switching vendors
- Explain price spreads between sources
- Answer questions about specific vendor offerings
- Advise on order timing based on forecasts and recommendations
 
## Guidelines:
- Always show prices in $/MT format
- When comparing, use tables for clarity
- Highlight the cheapest option with context (trade-offs like higher MOQ or longer lead time)
- Use the "Current Vendor Data" section (sent per-message) to know which real vendor names map to which price slots
- Be concise but thorough — this is a procurement decision tool
- Use markdown formatting for readability`;

export async function POST(req: NextRequest) {
    try {
        if (!process.env.OPENAI_API_KEY?.trim()) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY is not set. Add it to .env.local." },
                { status: 503 }
            );
        }

        const body = await req.json();
        const sessionId: string = body.session_id || "default";
        const userMessage: string = body.input_value;
        const vendorContext: string | undefined = body.vendor_context;

        // Get or create session history
        if (!sessions.has(sessionId)) {
            const systemMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
                { role: "system", content: SYSTEM_PROMPT },
            ];
            // If vendor context is provided, inject it as a system message
            if (vendorContext) {
                systemMessages.push({
                    role: "system",
                    content: `## Current Vendor Data from Dashboard:\n${vendorContext}`,
                });
            }
            sessions.set(sessionId, systemMessages);
        } else if (vendorContext) {
            // Update vendor context if vendors changed
            const history = sessions.get(sessionId)!;
            const vendorMsgIdx = history.findIndex(
                (m) => m.role === "system" && typeof m.content === "string" && m.content.startsWith("## Current Vendor Data")
            );
            const vendorMsg: OpenAI.Chat.ChatCompletionMessageParam = {
                role: "system",
                content: `## Current Vendor Data from Dashboard:\n${vendorContext}`,
            };
            if (vendorMsgIdx >= 0) {
                history[vendorMsgIdx] = vendorMsg;
            } else {
                history.splice(1, 0, vendorMsg);
            }
        }

        const history = sessions.get(sessionId)!;
        history.push({ role: "user", content: userMessage });

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: history,
            temperature: 0.4,
            max_tokens: 2048,
        });

        const assistantContent =
            completion.choices[0]?.message?.content ||
            "Sorry, I am unable to process your request.";

        history.push({ role: "assistant", content: assistantContent });

        // Keep history manageable (system + last 30 messages)
        const systemMsgs = history.filter((m) => m.role === "system");
        const nonSystem = history.filter((m) => m.role !== "system");
        if (nonSystem.length > 30) {
            sessions.set(sessionId, [...systemMsgs, ...nonSystem.slice(-30)]);
        }

        return NextResponse.json({ message: assistantContent });
    } catch (error) {
        console.error("OpenAI API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

