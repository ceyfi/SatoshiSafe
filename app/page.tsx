'use client';

import React, { useState, useEffect, useRef } from 'react';

// TradingView Live Chart Component
function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container.current && !container.current.querySelector('script')) {
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = JSON.stringify({
        "autosize": true,
        "symbol": "BINANCE:BTCUSDT",
        "interval": "60",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "en",
        "allow_symbol_change": false,
        "calendar": false,
        "support_host": "https://www.tradingview.com"
      });
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container h-[400px] w-full" ref={container}>
      <div className="tradingview-widget-container__widget h-[400px] w-full"></div>
    </div>
  );
}

export default function Home() {
  const [cryptoData, setCryptoData] = useState<any>(null);
  const [newsData, setNewsData] = useState<any[]>([]);
  
  // Varijable forme usklađene sa API-jem
  const [walletType, setWalletType] = useState('exchange');
  const [backupMethod, setBackupMethod] = useState('paper');
  const [antivirus, setAntivirus] = useState('no');
  
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Security Checklist
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Enable 2FA via Google Authenticator (No SMS)", done: false },
    { id: 2, text: "Keep your 12/24 recovery phrase strictly on paper or metal", done: false },
    { id: 3, text: "Withdraw assets above $500 to Cold Storage", done: false },
    { id: 4, text: "Set up an Anti-Phishing code on your exchange", done: false }
  ]);

  const toggleChecklist = (id: number) => {
    setChecklist(checklist.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  useEffect(() => {
    // Fetch price and sentiment
    fetch('/api/crypto')
      .then(res => res.json())
      .then(data => setCryptoData(data))
      .catch(() => setCryptoData({ price: 78247, fgi: 31, status: "Fear", verdict: "STABLE", advice: "Data protected." }));

    // News Fetching
    fetch('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss/tag/bitcoin')
      .then(res => res.json())
      .then(data => {
        if (data && data.items) {
          const formattedNews = data.items.slice(0, 6).map((item: any, index: number) => ({
            id: index,
            title: item.title,
            url: item.link,
            source: "COINTELEGRAPH"
          }));
          setNewsData(formattedNews);
        }
      })
      .catch(() => {
        setNewsData([
          { id: 1, title: "Securing Bitcoin Holdings Ahead of Market Volatility", url: "#", source: "SATOSHI//SAFE" },
          { id: 2, title: "Why Hardware Wallets Remain the Only Standard for Self-Custody", url: "#", source: "INTEL" }
        ]);
      });
  }, []);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuditResult(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletType, backupMethod, antivirus }),
      });
      if (!res.ok) throw new Error("Audit failed");
      const aiResponse = await res.json();
      setAuditResult(aiResponse);
    } catch (err) {
      console.error(err);
      setAuditResult({
        score: 75,
        verdict: "AUDIT FAILED",
        advice: "Failed to securely stream AI analysis. Ensure your network settings and API configurations are live."
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cryptoData) return <div className="min-h-screen bg-[#0d1117] text-white flex items-center justify-center font-mono">Initializing SatoshiSafe Intel Hub...</div>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] font-sans p-4 md:p-6">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto mb-8 border-b border-[#21262d] pb-4">
        <h1 className="text-xl font-bold text-emerald-400 tracking-wider">SATOSHI//SAFE</h1>
        <div className="flex gap-4 text-xs">
          <span className="bg-[#161b22] px-3 py-1.5 rounded-full border border-[#21262d] text-emerald-400 font-mono">● LIVE DATA ACTIVE</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        
        {/* TOP METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-[#161b22] p-5 rounded-xl border border-[#21262d]">
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Bitcoin Price</p>
            <p className="text-2xl font-mono font-bold text-white">${cryptoData.price.toLocaleString()}</p>
            <span className="text-[10px] text-emerald-500 font-mono">● Real-time Feed</span>
          </div>

          <div className="bg-[#161b22] p-5 rounded-xl border border-[#21262d]">
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Fear & Greed Index</p>
            <p className="text-2xl font-mono font-bold text-white">{cryptoData.fgi}/100</p>
            <span className="text-[10px] text-amber-400 font-mono">Status: {cryptoData.status}</span>
          </div>

          <div className="bg-[#161b22] p-5 rounded-xl border border-[#21262d]">
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">Next Halving Epoch</p>
            <p className="text-2xl font-mono font-bold text-emerald-400">~ April 2028</p>
            <span className="text-[10px] text-[#8b949e] font-mono">Block Reward: 1.5625 BTC</span>
          </div>

          <div className="bg-[#161b22] p-5 rounded-xl border border-[#21262d]">
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-1">System Health</p>
            <p className="text-2xl font-mono font-bold text-cyan-400">SECURE</p>
            <span className="text-[10px] text-[#8b949e] font-mono">AI Verification Node Loaded</span>
          </div>
        </div>

        {/* MIDDLE SECTION: AUDIT & CHECKLIST */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COL 1: AI SECURITY SCANNER */}
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#21262d] lg:col-span-1">
            <h3 className="text-md font-semibold mb-4 text-white uppercase tracking-wider text-sm text-emerald-400">AI Security Scanner</h3>
            <form onSubmit={handleAuditSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#8b949e] uppercase mb-1">Where do you currently store your primary crypto assets?</label>
                <select 
                  value={walletType} 
                  onChange={(e) => setWalletType(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  disabled={loading}
                >
                  <option value="exchange">Crypto Exchange (Binance, Coinbase, Nexo...)</option>
                  <option value="software">Software Wallet App (Metamask, TrustWallet)</option>
                  <option value="hardware">Hardware Wallet (Ledger, Trezor, Keystone)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8b949e] uppercase mb-1">How is your 12/24 recovery seed phrase backed up?</label>
                <select 
                  value={backupMethod} 
                  onChange={(e) => setBackupMethod(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  disabled={loading}
                >
                  <option value="paper">Written on a standard piece of paper</option>
                  <option value="digital">Saved digitally (Photo, Notepad, Cloud, Email)</option>
                  <option value="metal">Stamped into a Stainless Steel plate</option>
                  <option value="none">I don't have it / I don't remember where it is</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#8b949e] uppercase mb-1">Do you routinely check devices with premium antivirus/VPN setups?</label>
                <select 
                  value={antivirus} 
                  onChange={(e) => setAntivirus(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#21262d] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  disabled={loading}
                >
                  <option value="no">No, I just use default network settings</option>
                  <option value="yes">Yes, active paid premium guard software</option>
                </select>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className={`w-full text-black font-bold text-xs p-3 rounded-lg transition-all uppercase tracking-wider ${loading ? 'bg-emerald-500/40 cursor-not-allowed animate-pulse' : 'bg-emerald-500 hover:bg-emerald-400'}`}
              >
                {loading ? 'Analyzing...' : 'Run Analysis →'}
              </button>
            </form>
          </div>

          {/* COL 2: AI SCAN RESULT + AFFILIATE 1 */}
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#21262d] lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-semibold mb-4 text-white uppercase tracking-wider text-sm text-cyan-400">Your Scan Result</h3>
              
              {loading && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-10 bg-[#0d1117] rounded border border-[#21262d]"></div>
                  <div className="h-24 bg-[#0d1117] rounded border border-[#21262d]"></div>
                </div>
              )}

              {!loading && auditResult && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#0d1117] rounded border border-[#21262d] flex justify-between items-center">
                    <span className="text-[11px] text-[#8b949e]">RISK STATUS:</span>
                    <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      auditResult.verdict === 'CRITICAL RISK' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      auditResult.verdict === 'MEDIUM RISK' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>{auditResult.verdict} ({auditResult.score}/100)</span>
                  </div>
                  <p className="text-xs text-[#8b949e] bg-[#0d1117] p-3 rounded border border-[#21262d] leading-relaxed whitespace-pre-line font-mono">
                    {auditResult.advice}
                  </p>
                  
                  {/* SIGURNO DUGME ZA DELJENJE NA X BEZ SVG-ova */}
                  <div className="pt-2 flex justify-center">
                    <a 
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Just scanned my Bitcoin security setup on SatoshiSafe – scored ${auditResult.score}/100 😬 Threat Level: ${auditResult.verdict}. Scan your vault at https://satoshi-safe.vercel.app/`
                      )}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full text-center bg-white text-black font-bold text-[11px] tracking-wide py-2 rounded hover:bg-neutral-200 transition-all font-mono"
                    >
                      Share Score on X 🔗
                    </a>
                  </div>
                </div>
              )}

              {!loading && !auditResult && (
                <p className="text-xs text-[#8b949e] italic leading-relaxed">
                  Select your storage options on the left to check your security score and get instant recommendations.
                </p>
              )}
            </div>

            {/* MONETIZACIJA 1 */}
            <div className="mt-4 pt-3 border-t border-[#21262d]">
              <div className="flex justify-between items-center p-3 bg-[#0d1117] rounded border border-dashed border-emerald-500/20 text-xs">
                <div>
                  <h4 className="font-medium text-white">Recommended Vault</h4>
                  <p className="text-[10px] text-[#8b949e]">Take total control of your private keys.</p>
                </div>
                <a href="https://shop.ledger.com/?r=344d1075931d" target="_blank" rel="noopener noreferrer" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[11px] px-3 py-1.5 rounded hover:bg-emerald-500 hover:text-black transition-all">
                  Get Ledger 🔗
                </a>
              </div>
            </div>
          </div>

          {/* COL 3: SECURITY TASKS */}
          <div className="bg-[#161b22] p-6 rounded-xl border border-[#21262d] lg:col-span-1 flex flex-col justify-between">
            <div>
              <h3 className="text-md font-semibold mb-4 text-white uppercase tracking-wider text-sm text-amber-400">Security Checklist</h3>
              <div className="space-y-2.5">
                {checklist.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => toggleChecklist(item.id)}
                    className={`p-2.5 rounded-lg border text-xs flex items-center gap-3 cursor-pointer transition-all ${item.done ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400 line-through' : 'bg-[#0d1117] border-[#21262d] text-gray-300 hover:border-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center font-mono font-bold text-[10px] ${item.done ? 'bg-emerald-500 border-emerald-500 text-black' : 'border-[#21262d]'}`}>
                      {item.done && "✓"}
                    </div>
                    <span className="flex-1 text-[11px]">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#21262d] space-y-2">
              <div className="flex justify-between items-center p-2.5 bg-[#0d1117] rounded border border-[#21262d] text-[11px]">
                <span className="text-[#8b949e]">🔥 Fireproof Metal Backup:</span>
                <a href="https://keyst.one/?rfsn=9116030.71461e&utm_source=refersion&utm_medium=affiliate&utm_campaign=9116030.71461e" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline font-medium">Keystone Tablet🔗</a>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-[#0d1117] rounded border border-[#21262d] text-[11px]">
                <span className="text-[#8b949e]">🔒 Privacy Layer (No IP Leak):</span>
                <a href="https://www.nordvpn.com" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline font-medium">NordVPN Premium 🔗</a>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: CHART & NEWS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="bg-[#161b22] p-4 rounded-xl border border-[#21262d] lg:col-span-2 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> BTC/USDT Market Structure
            </h3>
            <TradingViewWidget />
            
            <div className="w-full h-14 bg-[#0d1117] rounded-lg border border-dashed border-[#30363d] flex items-center justify-center text-xs text-[#8b949e] tracking-wider">
              [ ADVERTISEMENT BANNER / GOOGLE ADSENSE SLOT ]
            </div>
          </div>

          <div className="bg-[#161b22] p-5 rounded-xl border border-[#21262d] lg:col-span-1">
            <h3 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider text-rose-400">Global Cyber News Feed</h3>
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {newsData.length > 0 ? (
                newsData.map((news) => (
                  <div key={news.id} className="p-3 bg-[#0d1117] rounded border border-[#21262d] hover:border-[#30363d] transition-all">
                    <span className="text-[10px] font-mono text-emerald-500 block mb-1">[{news.source}]</span>
                    <a href={news.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-200 hover:text-emerald-400 transition-colors font-medium block leading-snug">
                      {news.title}
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#8b949e] italic">Streaming latest network logs...</p>
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}