import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AnalysisResult, GroundingChunk } from '../types';
import MarketChart from './MarketChart';
import { Globe, Building2, ArrowRight, Compass } from './Icons';

interface ResultsViewProps {
  result: AnalysisResult;
  keyword: string;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, keyword }) => {
  const { markdownReport, structuredData, groundingChunks } = result;

  const validSources = groundingChunks.filter(c => c.web?.uri || c.maps?.uri);

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* Executive Summary Card */}
      {structuredData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
             <MarketChart data={structuredData.topCountries} />
          </div>
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3 text-teal-300">
                <Compass className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">行动指南</span>
              </div>
              <p className="text-lg font-medium leading-relaxed">
                {structuredData.suggestedAction || "根据数据，建议重点关注搜索量最高的市场，并针对当地文化优化产品描述。"}
              </p>
            </div>
            
            <div className="mt-6">
              <div className="text-xs text-teal-400 mb-2 uppercase">主要竞争对手</div>
              <div className="flex flex-wrap gap-2">
                {structuredData.competitors.map((comp, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded-md text-xs backdrop-blur-sm border border-white/10">
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Report Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-600" />
            全球市场深度分析报告: {keyword}
          </h2>
        </div>
        
        <div className="p-6 md:p-8 prose prose-slate max-w-none prose-headings:text-slate-800 prose-a:text-teal-600 hover:prose-a:text-teal-700">
          <ReactMarkdown>{markdownReport}</ReactMarkdown>
        </div>
      </div>

      {/* Sources / Grounding */}
      {validSources.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            数据来源 (Google Search Grounding)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {validSources.map((source, idx) => {
              const uri = source.web?.uri || source.maps?.uri;
              const title = source.web?.title || source.maps?.title || "Source";
              if (!uri) return null;
              
              return (
                <a 
                  key={idx} 
                  href={uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:bg-teal-50">
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-medium text-slate-700 truncate group-hover:text-teal-700">{title}</div>
                    <div className="text-xs text-slate-400 truncate">{new URL(uri).hostname}</div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsView;