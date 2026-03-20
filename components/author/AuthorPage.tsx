import React from 'react';
import { Author, Article } from '../../types';
import GlassCard from '../GlassCard';
import ArticleCard from '../articles/ArticleCard';

interface AuthorPageProps {
  author: Author;
  articles: Article[];
  onBack: () => void;
  onSelectArticle: (article: Article) => void;
}

const AuthorPage: React.FC<AuthorPageProps> = ({ author, articles, onBack, onSelectArticle }) => {
  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-32 pb-24 sm:pb-32 page-transition-wrapper snap-start">
      <GlassCard className="max-w-4xl mx-auto mb-12">
        <button onClick={onBack} className="mb-8 text-sm font-semibold text-white hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {author.id === 'ai-powered-novus' ? 'Back to Trending' : 'Back to Home'}
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-8">
          <img src={author.avatarUrl} alt={author.name} className="w-32 h-32 rounded-full object-cover shrink-0 border-2 border-white/30" />
          <div>
            <h1 className="text-4xl font-bold text-white">{author.name}</h1>
            <p className="text-gray-300 mt-4">{author.bio}</p>
          </div>
        </div>
      </GlassCard>

      <h2 className="text-3xl font-bold text-center text-white mb-10">Articles by {author.name}</h2>
      {articles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {articles.map(article => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onClick={() => onSelectArticle(article)} 
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400">No articles found for this author.</p>
      )}
    </div>
  );
};

export default AuthorPage;