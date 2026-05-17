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
- Primary storage: ${label(WALLET_LABELS, walletType, walletType