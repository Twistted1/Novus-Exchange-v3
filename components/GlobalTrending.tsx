import React, { useState, useEffect } from 'react';
import { Article } from '../types';
import { getTrendingArticles } from '../api/cms';

interface GlobalTrendingProps {
  onSelectArticle: (article: Article) => void;
}

const TrendingCard: React.FC<{ article: Article; onClick: () => void; index: number }> = ({ article, onClick, index }) => {
  return (
    <div 
      onClick={onClick}
      style={{ transitionDelay: `${index * 150}ms` }}
      className="cursor-pointer group bg-[#161618] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-500 hover:border-cyan-500/40 hover:bg-[#1c1c1e] hover:shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:-translate-y-2 hover:scale-[1.02]"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161618] to-transparent"></div>
        <div className="absolute bottom-3 left-6 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-bold text-cyan-500 uppercase tracking-[0.2em]">Live Intelligence</span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-3 leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400 mb-6 flex-grow leading-relaxed font-normal line-clamp-3">
          {article.excerpt}
        </p>
        <div className="mt-auto pt-4 border-t border-white/5">
          <span className="text-white text-xs font-bold flex items-center gap-2 group-hover:gap-3 transition-all uppercase tracking-widest">
            Detailed Analysis <span className="text-lg">→</span>
          </span>
        </div>
      </div>
    </div>
  );
};

const GlobalTrending: React.FC<GlobalTrendingProps> = ({ onSelectArticle }) => {
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today');

    getTrendingArticles().then(articles => {
      setTrendingArticles(articles);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 stagger-fade-in-up-trigger">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 bg-[#e62e2e]/10 border border-[#e62e2e]/20 px-4 py-1.5 rounded-full mb-8">
            <span className="text-xs font-black text-[#e62e2e] uppercase tracking-[0.3em]">AI-Powered Research</span>
            <span className="w-px h-3 bg-white/20"></span>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Update: {lastUpdated}</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight flex items-center justify-center gap-3">
          GLOBAL <span className="text-[#e62e2e]">TRENDING</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-[0.2em] font-bold">
          Real-time geopolitical and economic analysis curated by Gemini Intelligence, synthesizing global market movements and power shifts.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <div className="w-12 h-12 border-2 border-[#e62e2e]/30 border-t-[#e62e2e] rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.4em] animate-pulse">Consulting Global Data intelligence...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-fade-in-up">
          {trendingArticles.map((article, idx) => (
            <TrendingCard
              key={article.id}
              article={article}
              index={idx}
              onClick={() => onSelectArticle(article)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalTrending;