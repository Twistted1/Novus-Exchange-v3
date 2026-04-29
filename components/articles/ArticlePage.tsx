import React from 'react';
import { Article, Author, AskNovusHighlightFn } from '../../types';
import GlassCard from '../GlassCard';
import ArticleCard from './ArticleCard';
import SEO from '../SEO';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArticlePageProps {
  /** The article to display */
  article: Article;
  /** List of all available articles (used for "Read Next" section) */
  articles: Article[];
  /** Callback to navigate back to the previous view */
  onBack: () => void;
  /** Callback when a related article is clicked */
  onSelectArticle: (article: Article) => void;
  /** Callback when the author's profile is clicked */
  onSelectAuthor: (author: Author) => void;
  /** Callback triggered when text is highlighted (currently a placeholder) */
  onAskNovusHighlight: AskNovusHighlightFn;
}

/**
 * ArticlePage Component
 * 
 * Displays a full article including its title, author, cover image, and content.
 * The content is rendered using ReactMarkdown. It also includes SEO metadata
 * via react-helmet-async and a "Read Next" section suggesting other articles.
 */
const ArticlePage: React.FC<ArticlePageProps> = ({ article, articles, onBack, onSelectArticle, onSelectAuthor, onAskNovusHighlight }) => {
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();
    if (selectedText && selectedText.length > 5 && selectedText.length < 200) {
      onAskNovusHighlight(selectedText);
    }
  };

  const otherArticles = articles.filter(a => a.id !== article.id).slice(0, 3);

  return (
    <div className="container mx-auto px-4 sm:px-6 md:px-8 pt-32 pb-24 sm:pb-32 page-transition-wrapper snap-start">
      <SEO 
        title={article.title} 
        description={article.excerpt} 
        image={article.imageUrl} 
        type="article"
      />
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-8 text-sm font-semibold text-white hover:underline flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {Number(article.id) >= 1000 ? 'Back to Trending' : 'Back to Home'}
        </button>

        <article>
          <span className="text-cyan-400 uppercase tracking-wider text-sm font-semibold">{article.category}</span>
          <h1 className="text-2xl md:text-3xl font-bold text-white mt-2 mb-6 leading-tight tracking-tight">{article.title}</h1>
          
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/20">
            <button onClick={() => onSelectAuthor(article.author)} className="flex items-center gap-3 group">
              <div className="relative">
                <img src={article.author.avatarUrl} alt={article.author.name} className="w-12 h-12 rounded-full object-cover border-2 border-white/30 group-hover:border-cyan-400 transition-colors" />
                {Number(article.id) >= 1000 && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-black flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-white group-hover:text-cyan-400 transition-colors">{article.author.name}</p>
                <p className="text-sm text-gray-400">{article.date} · {article.readTime} min read</p>
              </div>
            </button>
          </div>
          
          <div className="relative w-full h-[300px] md:h-[450px] overflow-hidden rounded-2xl mb-10 shadow-2xl border border-white/10">
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              loading="lazy" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>

          <div className="prose prose-lg prose-invert prose-cyan max-w-none text-gray-300" onMouseUp={handleMouseUp}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {article.content}
            </ReactMarkdown>
          </div>
        </article>
        
        <div className="mt-16 pt-12 border-t border-white/20">
            <h2 className="text-3xl font-bold text-center text-white mb-10">Read Next</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherArticles.map(nextArticle => (
                    <ArticleCard 
                        key={nextArticle.id} 
                        article={nextArticle} 
                        onClick={() => onSelectArticle(nextArticle)} 
                    />
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;