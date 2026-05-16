import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Povuci cenu Bitcoina sa CoinGecko API-ja
    const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', {
      next: { revalidate: 60 } // Keširaj podatke na 60 sekundi da ne blokiraju API
    });
    const priceData = await priceRes.json();
    const currentPrice = priceData.bitcoin.usd;

    // 2. Povuci Fear & Greed Indeks
    const fgiRes = await fetch('https://api.alternative.me/fng/', {
      next: { revalidate: 3600 } // Keširaj na sat vremena
    });
    const fgiData = await fgiRes.json();
    const fgiValue = parseInt(fgiData.data[0].value);
    const fgiStatus = fgiData.data[0].value_classification;

    // 3. Logika za AI Safety Verdict (Gemini logika u hodu)
    let verdict = "STABLE";
    let advice = "Dobar trenutak za akumulaciju na hladne novčanike.";

    if (fgiValue > 75) {
      verdict = "GREED ALERT";
      advice = "Tržište je u ekstremnoj pohlepi. Razmislite o osiguravanju profita i prebacivanju u hladno skladište.";
    } else if (fgiValue < 30) {
      verdict = "FEAR OPPORTUNITY";
      advice = "Strah je na maksimumu. Istorijski gledano, ovo su najbolji trenuci za bezbedno dugoročno investiranje.";
    }

    return NextResponse.json({
      price: currentPrice,
      fgi: fgiValue,
      status: fgiStatus,
      verdict: verdict,
      advice: advice
    });

  } catch (error) {
    // Ako API zakže, šaljemo "fallback" podatke da sajt ne pukne
    return NextResponse.json({
      price: 78219,
      fgi: 47,
      status: "Neutral",
      verdict: "STABLE",
      advice: "Podaci se trenutno osvežavaju. Ostanite sigurni."
    });
  }
}