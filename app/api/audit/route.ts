import { NextResponse } from "next/server";

const WALLET_LABELS: Record<string, string> = {
  exchange: "Crypto Exchange (custodial — Binance, Coinbase, Nexo, etc.)",
  software: "Software / hot wallet (Metamask, TrustWallet, etc.)",
  hardware: "Hardware cold wallet (Ledger, Trezor, Keystone, etc.)",
};

const BACKUP_LABELS: Record<string, string> = {
  paper: "Recovery seed written on standard paper",
  digital: "Recovery seed saved digitally (photo, notepad, cloud, email)",
  metal: "Recovery seed stamped on stainless steel / metal plate",
  none: "No backup or unknown seed location",
};

const AV_LABELS: Record<string, string> = {
  yes: "Active premium antivirus / VPN setup",
  no: "Default network settings only (no premium guard)",
};

function label(map: Record<string, string>, key: string, fallback: string) {
  return map[key] ?? fallback;
}

export async function POST(request: Request) {
  try {
    const { walletType, backupMethod, antivirus } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const prompt = `You are an elite Bitcoin security expert and threat intelligence officer.
Analyze the following user security setup:
- Primary storage: ${label(WALLET_LABELS, walletType, walletType ?? "unknown")}
- Recovery seed backup: ${label(BACKUP_LABELS, backupMethod, backupMethod ?? "unknown")}
- Device protection: ${label(AV_LABELS, antivirus, antivirus ?? "unknown")}

Provide your expert threat analysis in strict JSON format. Do not include markdown fences or any text outside the JSON. Return EXACTLY this structure:
{
  "score": <number 0-100 where 100 is maximum danger>,
  "verdict": "<exactly one of: CRITICAL RISK, MEDIUM RISK, or LOW RISK>",
  "advice": "<2 to 4 sentences of detailed professional actionable advice tailored to this exact setup. If they use an exchange or weak backup strongly recommend hardware cold storage such as Ledger and metal seed backup. Use plain text only no markdown.>"
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini HTTP ${response.status}`);
    }

    const resData = await response.json();
    const rawText = resData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty Gemini response");

    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);