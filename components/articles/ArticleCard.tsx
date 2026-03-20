import React from 'react';
import { Article } from '../../types';

interface ArticleCardProps {
  article: Article;
  onClick: () => void;
  style?: React.CSSProperties;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, onClick, style }) => {
  return (
    <div 
      onClick={onClick} 
      className="cursor-pointer group bg-[#0e0e11] border border-white/10 rounded-2xl overflow-hidden h-full flex flex-col transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:-translate-y-2 hover:scale-[1.02]"
      style={style}
    >
      {/* Image Container with Badge */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img 
          src={article.imageUrl} 
          alt={article.title} 
          loading="lazy" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
        />
        <div className="absolute top-3 left-3 z-10">
          <div className="backdrop-blur-md bg-black/70 px-3 py-1 rounded-md border border-white/10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#7fe8d8]">
              {article.category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Text Content */}
      <div className="p-6 flex flex-col flex-grow bg-[#0e0e11]">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-[#e62e2e] transition-colors duration-300 leading-tight tracking-tight">
          {article.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-400 mb-4 flex-grow line-clamp-3 leading-relaxed font-normal">
          {article.excerpt}
        </p>
        
        {/* Footer Signature */}
        <div className="mt-auto pt-4 border-t border-white/[0.1] flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
            By {article.author.name}
          </span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            {article.readTime} MIN READ
          </span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;