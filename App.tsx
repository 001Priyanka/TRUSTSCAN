
import React, { useState, useEffect, useCallback } from 'react';
import { MOCK_STOCKS, SOLIDITY_CONTRACT_SOURCE, CONTRACT_ADDRESS } from './constants';
import { AppState, BreakoutSignal, Stock } from './types';
import { detectBreakouts } from './services/detectionService';
import { saveSignalToChain, getSignalsFromChain, clearChain } from './services/blockchainService';

// Sub-component for individual cards
const SignalCard: React.FC<{ signal: BreakoutSignal }> = ({ signal }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [tradeAction, setTradeAction] = useState<'BUY' | 'SELL' | null>(null);
  const [isProcessingTrade, setIsProcessingTrade] = useState(false);
  const [tradeConfirmed, setTradeConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const strengthPercentage = (signal.strength / 10) * 100;
  
  const getStrengthTextClass = (s: number) => {
    if (s >= 8) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (s >= 5) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  };

  const handleTrade = (type: 'BUY' | 'SELL') => {
    setTradeAction(type);
    setTradeConfirmed(false);
    setIsProcessingTrade(false);
  };

  const confirmTradeAction = async () => {
    setIsProcessingTrade(true);
    // Simulate some "processing" time for the trade
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessingTrade(false);
    setTradeConfirmed(true);
    
    // Auto-close after showing the success message
    setTimeout(() => {
      setTradeAction(null);
      setTradeConfirmed(false);
    }, 2000);
  };

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(signal.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div 
        className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-2xl hover:border-emerald-500/60 hover:scale-[1.02] hover:shadow-emerald-500/10 transition-all duration-300 group relative overflow-visible"
      >
        {/* Background glow effect on hover */}
        <div className="absolute -inset-px bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl z-0" />

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div onClick={() => setShowDetails(true)} className="cursor-pointer">
            <h3 className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">
              {signal.stockName}
            </h3>
            
            <div className="relative group/hash inline-block mt-1">
              <p className="text-slate-500 text-[10px] font-mono flex items-center gap-1 cursor-help hover:text-emerald-500/80 transition-colors">
                <i className="fa-solid fa-fingerprint text-slate-600 group-hover/hash:text-emerald-500"></i>
                {signal.txHash.substring(0, 8)}...{signal.txHash.substring(signal.txHash.length - 4)}
              </p>
              
              <div className="absolute left-0 bottom-full mb-3 hidden group-hover/hash:block z-[60] animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto">
                <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[280px] backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">On-Chain Proof</p>
                    <button 
                      onClick={handleCopyHash}
                      className="text-[9px] text-emerald-500 hover:text-emerald-400 font-black uppercase flex items-center gap-1 transition-colors"
                    >
                      {copied ? <><i className="fa-solid fa-check"></i> Copied</> : <><i className="fa-solid fa-copy"></i> Copy Hash</>}
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[8px] text-slate-500 uppercase font-bold mb-1">Cryptographic Hash</p>
                      <p className="text-[10px] font-mono text-emerald-400 break-all leading-tight bg-slate-950/50 p-2 rounded border border-slate-800/50">{signal.txHash}</p>
                    </div>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 bg-slate-900 border-r border-b border-slate-700 rotate-45 -mt-1.5 ml-4"></div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase mb-1">
              <i className="fa-solid fa-shield-halved"></i> Secured
            </div>
            <p className="text-slate-300 text-xs font-medium font-mono">
              {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="mb-6 p-3 bg-slate-900/50 rounded-xl border border-slate-700/50 relative z-10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Momentum</span>
            <div className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-tighter ${getStrengthTextClass(signal.strength)}`}>
              PWR {signal.strength}/10
            </div>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden p-[1px] shadow-inner">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 via-emerald-500 to-red-600 transition-all duration-1000 ease-out" style={{ width: `${strengthPercentage}%` }} />
          </div>
        </div>

        <div className="flex items-end justify-between relative z-10 mb-6">
          <div>
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest mb-1">Trigger Price</p>
            <div className="flex items-baseline gap-1">
              <span className="text-slate-400 text-sm font-medium">₹</span>
              <span className="text-3xl font-mono font-bold text-white group-hover:text-emerald-300 transition-colors">
                {signal.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10 mb-6">
          <button onClick={() => handleTrade('BUY')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">
            <i className="fa-solid fa-plus-circle"></i> Buy
          </button>
          <button onClick={() => handleTrade('SELL')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95">
            <i className="fa-solid fa-minus-circle"></i> Sell
          </button>
        </div>
      </div>

      {/* Breakout Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h4 className="text-lg font-black tracking-tight uppercase">Audit Trail</h4>
              <button onClick={() => setShowDetails(false)} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Immutable HASH proof</p>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-emerald-500 break-all">{signal.txHash}</div>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-center">
              <button onClick={() => setShowDetails(false)} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-black uppercase tracking-widest text-slate-300">Close Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* Trade Confirmation Modal */}
      {tradeAction && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-lg animate-in fade-in zoom-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`h-2 w-full ${tradeAction === 'BUY' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <div className="p-8">
              {!tradeConfirmed ? (
                <>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mb-6">Confirm {tradeAction}</h4>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center py-3 border-b border-slate-800">
                      <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Stock Asset</span>
                      <span className="text-lg font-black text-white">{signal.stockName}</span>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setTradeAction(null)} disabled={isProcessingTrade} className="flex-1 py-4 rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 font-black text-[10px] uppercase tracking-[0.2em] transition-all">Cancel</button>
                    <button onClick={confirmTradeAction} disabled={isProcessingTrade} className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2 ${tradeAction === 'BUY' ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-red-500 hover:bg-red-400 text-white'}`}>
                      {isProcessingTrade ? <i className="fa-solid fa-circle-notch animate-spin"></i> : `Confirm ${tradeAction}`}
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
                    <i className="fa-solid fa-check"></i>
                  </div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Order Submitted</h4>
                  <p className="text-slate-400 text-sm mb-6">Simulated <span className="text-white font-bold">{tradeAction}</span> order for <span className="text-white font-bold">{signal.stockName}</span> has been broadcasted.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_STOCKS);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [onChainSignals, setOnChainSignals] = useState<BreakoutSignal[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setOnChainSignals(getSignalsFromChain());
  }, []);

  const handleRunScanner = useCallback(async () => {
    setAppState(AppState.SCANNING);
    const detected = detectBreakouts(stocks);
    if (detected.length === 0) {
      alert("No breakouts detected currently. Market is stable.");
      setAppState(AppState.IDLE);
      return;
    }
    setAppState(AppState.RECORDING);
    for (const d of detected) {
      await saveSignalToChain(d);
    }
    setOnChainSignals(getSignalsFromChain());
    setAppState(AppState.COMPLETED);
    setTimeout(() => setAppState(AppState.IDLE), 2000);
  }, [stocks]);

  const handleClearHistory = () => {
    if (confirm("Permanently wipe local blockchain simulation data? This cannot be undone.")) {
      clearChain(); // Wipes localStorage
      setOnChainSignals([]); // Clears React UI state
      alert("Ledger has been cleared.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-emerald-600 text-slate-950 text-[10px] font-black uppercase tracking-[0.4em] py-1 text-center">
        <span><i className="fa-solid fa-lock"></i> AES-256 Secured Ledger</span>
      </div>

      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white text-xl"><i className="fa-solid fa-bolt"></i></div>
            <h1 className="text-xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">TrustScan</h1>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsModalOpen(true)} className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all"><i className="fa-solid fa-code text-sm"></i></button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-16 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-black mb-6 leading-[1.1] tracking-tighter text-white">Cryptographic <br/><span className="text-emerald-500">Breakout</span> Evidence.</h2>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed max-w-lg">TrustScan leverages Ethereum Smart Contracts to timestamp and lock trade signals the moment they occur. Zero manipulation. Total transparency.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleRunScanner} disabled={appState !== AppState.IDLE} className={`px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all ${appState === AppState.IDLE ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                {appState === AppState.IDLE ? <><i className="fa-solid fa-radar text-lg"></i> Run Secure Analysis</> : <><i className="fa-solid fa-circle-notch animate-spin text-lg"></i> {appState}...</>}
              </button>
              <button onClick={handleClearHistory} className="px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-500 border border-slate-800 hover:bg-slate-900 hover:text-red-400 transition-all flex items-center gap-2"><i className="fa-solid fa-trash-can text-xs"></i> Reset Ledger</button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 group"><div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-5"><i className="fa-solid fa-fingerprint text-xl"></i></div><h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">Unique Hashing</h4><p className="text-xs text-slate-500">Every signal is given a unique SHA-256 fingerprint for verification.</p></div>
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800/50 group"><div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5"><i className="fa-solid fa-user-shield text-xl"></i></div><h4 className="font-black text-white text-sm uppercase tracking-wider mb-2">Access Control</h4><p className="text-xs text-slate-500">Only verified scanner nodes can push alerts to the ledger.</p></div>
          </div>
        </section>

        <section className="relative">
          <h2 className="text-3xl font-black text-white mb-10">Secure Signal Feed</h2>
          {onChainSignals.length === 0 ? (
            <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-[2.5rem] p-24 flex flex-col items-center text-center">
              <i className="fa-solid fa-shield-slash text-5xl mb-8 text-slate-700"></i>
              <h3 className="text-2xl font-black text-slate-400 mb-3">Ledger Empty</h3>
              <p className="text-slate-500 max-w-sm">No breakout signals have been secured in this session.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {onChainSignals.map((sig) => <SignalCard key={sig.id} signal={sig} />)}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in zoom-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">Security Logic Protocol</h3>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-all"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="p-8 overflow-auto flex-grow bg-slate-950/40">
              <pre className="text-xs font-mono text-emerald-400 leading-relaxed">{SOLIDITY_CONTRACT_SOURCE.trim()}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
