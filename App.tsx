import React, { useState } from 'react';
import { Search, Loader2, TrendingUp, Globe } from './components/Icons';
import { analyzeMarket } from './services/geminiService';
import { AnalysisResult, AnalysisStatus } from './types';
import ResultsView from './components/ResultsView';

const SUGGESTED_KEYWORDS = ["Solar Panels", "Ceramic Mugs", "Electric Bikes", "Smart Watches", "Pet Toys"];

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setStatus(AnalysisStatus.LOADING);
    setResult(null);
    setErrorMsg('');

    try {
      const data = await analyzeMarket(query);
      setResult(data);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (error) {
      console.error(error);
      setStatus(AnalysisStatus.ERROR);
      setErrorMsg("分析过程中遇到问题，请稍后重试或检查网络连接。");
    }
  };

  const handleSuggestionClick = (keyword: string) => {
    setQuery(keyword);
    // Use a timeout to allow state update before triggering search, 
    // or just call search directly with the keyword.
    // Better UX: Fill input, user presses search, OR auto search. 
    // Let's auto-search for slickness.
    // We need to pass the keyword to search function to avoid stale state closure issue if we just called handleSearch()
    // But handleSearch uses `query` state.
    // Let's just set query and call a separate function or use useEffect. 
    // Simpler: Just set query. User clicks button. 
    // Even better: Set query and trigger loading immediately.
    setQuery(keyword);
    // Hack for immediate trigger
    setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        // Ideally we refactor handleSearch to take an argument, but for this simple app:
        // We will just do it properly below.
    }, 0);
  };

  // Refactored trigger to support direct argument
  const triggerSearch = async (keyword: string) => {
      setQuery(keyword);
      setStatus(AnalysisStatus.LOADING);
      setResult(null);
      setErrorMsg('');
      try {
        const data = await analyzeMarket(keyword);
        setResult(data);
        setStatus(AnalysisStatus.SUCCESS);
      } catch (error) {
        setStatus(AnalysisStatus.ERROR);
        setErrorMsg("分析失败，请检查网络或稍后重试。");
      }
  };


  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 p-2 rounded-lg text-white">
               <Globe className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              出海罗盘 <span className="text-slate-400 font-normal text-sm ml-1 hidden sm:inline">Global Trade Compass</span>
            </span>
          </div>
          {status === AnalysisStatus.SUCCESS && (
            <button 
              onClick={() => { setStatus(AnalysisStatus.IDLE); setQuery(''); setResult(null); }}
              className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
            >
              新搜索
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Search Hero Section - Only show when IDLE */}
        {status === AnalysisStatus.IDLE && (
          <div className="w-full max-w-3xl text-center space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                数据驱动，<span className="text-teal-600">精准出海</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                利用 Google 实时搜索数据，为您的产品找到最热门的海外市场。
                无论是内贸转型还是拓展新市场，这里都是您的第一站。
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 flex items-center max-w-2xl mx-auto transition-transform hover:scale-[1.01]">
              <Search className="w-6 h-6 text-slate-400 ml-4" />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="输入产品关键词，例如：Solar Panels, Ceramic Mugs..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-slate-800 placeholder:text-slate-400"
              />
              <button 
                onClick={handleSearch}
                disabled={!query.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2"
              >
                开始分析
              </button>
            </div>

            <div className="pt-8">
              <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-wide">热门搜索示例</p>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => triggerSearch(kw)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {status === AnalysisStatus.LOADING && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-100 rounded-full animate-ping opacity-75"></div>
              <div className="bg-white p-4 rounded-full shadow-lg relative z-10">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
              </div>
            </div>
            <h3 className="mt-8 text-xl font-semibold text-slate-800">正在扫描全球市场数据...</h3>
            <p className="text-slate-500 mt-2 max-w-md text-center">
              Gemini 正在分析 "{query}" 的 Google 搜索趋势、竞争对手以及潜在买家分布。
            </p>
          </div>
        )}

        {/* Results State */}
        {status === AnalysisStatus.SUCCESS && result && (
          <div className="w-full">
            <div className="mb-8 flex items-center justify-between">
               <h2 className="text-2xl font-bold text-slate-800">分析结果</h2>
               <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                 关键词: <span className="font-semibold text-slate-900">{query}</span>
               </div>
            </div>
            <ResultsView result={result} keyword={query} />
          </div>
        )}

        {/* Error State */}
        {status === AnalysisStatus.ERROR && (
           <div className="text-center py-20 max-w-md mx-auto animate-fade-in">
             <div className="bg-red-50 text-red-500 p-4 rounded-full inline-flex mb-4">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h3 className="text-lg font-bold text-slate-800 mb-2">出错了</h3>
             <p className="text-slate-600 mb-6">{errorMsg}</p>
             <button 
               onClick={() => setStatus(AnalysisStatus.IDLE)}
               className="text-teal-600 font-semibold hover:underline"
             >
               返回首页
             </button>
           </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Global Trade Compass. Powered by Google Gemini API.</p>
          <p className="mt-2 text-xs">Data provided for informational purposes only. Verification recommended before business decisions.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;