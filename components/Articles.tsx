import React from 'react';
import { Article } from '../types';
import ArticleCard from './articles/ArticleCard';

interface ArticlesProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  showFilters: boolean;
}

const Articles: React.FC<ArticlesProps> = ({ articles, onSelectArticle, showFilters }) => {
  return (
    <div className="w-full max-w-6xl mx-auto stagger-fade-in-up-trigger flex flex-col items-center">
      <div className="text-center mb-16 px-4">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight flex items-center justify-center gap-3">
          LATEST <span className="text-[#e62e2e]">ARTICLES</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed font-bold uppercase tracking-[0.2em]">
          Investigative pieces and in-depth analysis published through our dedicated content engine.
        </p>
      </div>

      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full stagger-fade-in-up">
          {articles.map((article, index) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onClick={() => onSelectArticle(article)} 
              style={{ transitionDelay: `${index * 150}ms` }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
            <h3 className="text-sm font-bold mb-2 uppercase tracking-widest text-gray-700">No Articles Available</h3>
            <p className="text-[10px] text-gray-800 uppercase tracking-widest">Updating CMS connection...</p>
        </div>
      )}
    </div>
  );
};

export default Articles;