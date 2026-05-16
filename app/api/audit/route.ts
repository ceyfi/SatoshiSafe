import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { exchange, amount, hasBackup } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    // Konstruišemo precizan prompt za Gemini agente
    const prompt = `You are an elite Bitcoin security expert and threat intelligence officer. 
    Analyze the following user security setup:
    - Storage Method: ${exchange}
    - Bitcoin Balance: ${amount} BTC
    - Has offline recovery seed backup: ${hasBackup}

    Provide your expert threat analysis in a strict JSON format. Do not include any markdown formatting like \`\`\`json or regular text outside the JSON. Return EXACTLY this structure:
    {
      "score": <number between 0 and 100 representing total risk, where 100 is maximum danger>,
      "verdict": "<CRITICAL RISK, MEDIUM RISK, or LOW RISK based on the score>",
      "advice": "<Detailed, professional, and actionable advice up to 3 sentences long tailored to this exact scenario. Bold important words if needed. If they use an exchange, heavily advise a cold storage hardware wallet like Ledger.>"
    }`;

    // Pozivamo zvanični Google Gemini API (Koristimo stabilni i brzi flash model)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const resData = await response.json();
    let rawText = resData.candidates[0].content.parts[0].text;
    
    // Čistimo tekst od potencijalnih markdown oznaka koje LLM može da vrati
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const parsedResult = JSON.parse(rawText);
    return NextResponse.json(parsedResult);

  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      score: 50,
      verdict: "SYSTEM ERROR",
      advice: "Could not connect to the AI intelligence node. Please review standard cold storage protocols manually."
    }, { status: 500 });
  }
}