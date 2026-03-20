import React, { useState, useEffect, useRef } from 'react';
import { Page, Article, Author, NovusMessage } from './types';
import { getArticles, getTrendingArticles } from './api/cms';
import { GoogleGenAI } from '@google/genai';

import Layout from './components/layout/Layout';
import Hero from './components/Hero';
import Mission from './components/About';
import Articles from './components/Articles';
import ArticlePage from './components/articles/ArticlePage';
import AuthorPage from './components/author/AuthorPage';
import GlobalTrending from './components/GlobalTrending';
import Ecosystem from './components/Ecosystem';
import Contact from './components/Contact';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
    const [activePage, setActivePage] = useState<Page>(Page.Home);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const [regularArticles, setRegularArticles] = useState<Article[]>([]);
    const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
    const [articlesLoading, setArticlesLoading] = useState<boolean>(true);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

    const [isChatbotOpen, setIsChatbotOpen] = useState(false);
    const [messages, setMessages] = useState<NovusMessage[]>([
        { id: 0, source: 'model', text: "Hello! I'm Novus, your AI research assistant. Ask me anything about our articles, global trends, or other complex topics." }
    ]);

    const sectionRefs = {
        [Page.Home]: useRef<HTMLDivElement>(null),
        [Page.Mission]: useRef<HTMLDivElement>(null),
        [Page.Articles]: useRef<HTMLDivElement>(null),
        [Page.GlobalTrending]: useRef<HTMLDivElement>(null),
        [Page.Ecosystem]: useRef<HTMLDivElement>(null),
        [Page.Contact]: useRef<HTMLDivElement>(null),
    };

    useEffect(() => {
        const loadArticles = async () => {
            try {
                setArticlesLoading(true);
                const [articles, trending] = await Promise.all([
                    getArticles(),
                    getTrendingArticles()
                ]);
                setRegularArticles(articles);
                setTrendingArticles(trending);
            } catch (error) {
                console.error("Failed to load articles:", error);
            } finally {
                setArticlesLoading(false);
            }
        };
        loadArticles();
    }, []);

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase().trim();
        if (!lowercasedQuery) {
            setFilteredArticles(regularArticles);
            return;
        }
        const searchTerms = lowercasedQuery.split(/[\s,]+/).filter(Boolean);
        const allAvailable = [...regularArticles, ...trendingArticles];
        const results = allAvailable.filter(article =>
            searchTerms.every(term =>
                article.title.toLowerCase().includes(term) ||
                article.excerpt.toLowerCase().includes(term) ||
                article.category.toLowerCase().includes(term) ||
                article.tags.some(tag => tag.toLowerCase().includes(term)) ||
                article.author.name.toLowerCase().includes(term)
            )
        );
        setFilteredArticles(results);
        if (searchQuery) handleNavClick(Page.Articles);
    }, [searchQuery, regularArticles, trendingArticles]);

    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '-50% 0px -50% 0px',
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    const pageMap: Record<string, Page> = {
                        'home': Page.Home,
                        'mission': Page.Mission,
                        'trending': Page.GlobalTrending,
                        'articles': Page.Articles,
                        'ecosystem': Page.Ecosystem,
                        'contact': Page.Contact
                    };
                    if (pageMap[id] && activePage !== Page.Article && activePage !== Page.Author) {
                        setActivePage(pageMap[id]);
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        Object.values(sectionRefs).forEach(ref => {
            if (ref.current) observer.observe(ref.current);
        });

        return () => observer.disconnect();
    }, [activePage, sectionRefs]);

    const handleNavClick = (page: Page) => {
        setActivePage(page);

        if (page === Page.Article || page === Page.Author) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSelectedArticle(null);
        setSelectedAuthor(null);
            
        setTimeout(() => {
            const target = sectionRefs[page as keyof typeof sectionRefs]?.current;
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }, 100);
    };

    const handleSelectArticle = (article: Article) => {
        setActivePage(Page.Article);
        setSelectedArticle(article);
        window.scrollTo(0, 0);
    };

    const handleSelectAuthor = (author: Author) => {
        setActivePage(Page.Author);
        setSelectedAuthor(author);
        window.scrollTo(0, 0);
    };

    const handleBackToHome = () => {
        if ((selectedArticle && selectedArticle.id >= 1000) || (selectedAuthor && selectedAuthor.id === 'ai-powered-novus')) {
            handleNavClick(Page.GlobalTrending);
        } else {
            handleNavClick(Page.Home);
        }
        setSelectedArticle(null);
        setSelectedAuthor(null);
    };

    const handleChatbotSendMessage = async (message: string) => {
        const userMessage: NovusMessage = { id: Date.now(), source: 'user', text: message };
        const loadingMessage: NovusMessage = { id: Date.now() + 1, source: 'model', isLoading: true };
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `User: ${message}`,
                config: { systemInstruction: "Answer briefly." }
            });
            const modelResponse: NovusMessage = { id: Date.now() + 2, source: 'model', text: response.text };
            setMessages(prev => [...prev.slice(0, -1), modelResponse]);
        } catch (error: any) {
            setMessages(prev => [...prev.slice(0, -1), { id: Date.now(), source: 'model', text: "Error." }]);
        }
    };

    const renderMainContent = () => {
        return (
            <div className="flex flex-col w-full items-center">
                <section ref={sectionRefs[Page.Home]} id="home" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden snap-start shrink-0 scroll-mt-20">
                    <Hero onNavClick={handleNavClick} />
                </section>

                <section ref={sectionRefs[Page.Mission]} id="mission" className="w-full min-h-screen flex flex-col items-center justify-center px-4 snap-start shrink-0 scroll-mt-20">
                    <Mission />
                </section>

                <section ref={sectionRefs[Page.Articles]} id="articles" className="w-full min-h-screen flex flex-col items-center justify-center px-4 snap-start shrink-0 scroll-mt-20">
                    {articlesLoading ? (
                        <div className="text-center text-gray-700 text-xs uppercase tracking-[0.4em] py-20 font-bold">LOADING...</div>
                    ) : (
                        <Articles articles={filteredArticles} onSelectArticle={handleSelectArticle} showFilters={true} />
                    )}
                </section>

                <section ref={sectionRefs[Page.GlobalTrending]} id="trending" className="w-full min-h-screen flex flex-col items-center justify-center px-4 snap-start shrink-0 scroll-mt-20">
                    <GlobalTrending onSelectArticle={handleSelectArticle} />
                </section>

                <section ref={sectionRefs[Page.Ecosystem]} id="ecosystem" className="w-full min-h-screen flex flex-col items-center justify-center px-4 snap-start shrink-0 scroll-mt-20">
                    <Ecosystem onNavClick={handleNavClick} />
                </section>

                <section ref={sectionRefs[Page.Contact]} id="contact" className="w-full min-h-screen flex flex-col items-center justify-center px-4 snap-start shrink-0 scroll-mt-20">
                    <Contact />
                </section>
            </div>
        );
    };

    const renderDetailContent = () => {
        const allAvailable = [...regularArticles, ...trendingArticles];
        if (activePage === Page.Author && selectedAuthor) {
            const authorArticles = allAvailable.filter(a => a.author.id === selectedAuthor.id);
            return <AuthorPage author={selectedAuthor} articles={authorArticles} onBack={handleBackToHome} onSelectArticle={handleSelectArticle} />;
        }
        if (activePage === Page.Article && selectedArticle) {
            return <ArticlePage article={selectedArticle} articles={allAvailable} onBack={handleBackToHome} onSelectArticle={handleSelectArticle} onSelectAuthor={handleSelectAuthor} onAskNovusHighlight={() => {}} />;
        }
        return renderMainContent();
    };

    return (
        <div className="bg-black text-gray-100 font-sans selection:bg-red-600 selection:text-white flex flex-col items-center">
            <div className="fixed top-0 left-0 w-full h-full bg-[#030303] z-0"></div>
            <Layout activePage={activePage} onNavClick={handleNavClick} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
                <div className="w-full flex flex-col items-center">
                    {activePage === Page.Article || activePage === Page.Author ? renderDetailContent() : renderMainContent()}
                </div>
            </Layout>
            <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} messages={messages} onSendMessage={handleChatbotSendMessage} />
        </div>
    );
};

export default App;