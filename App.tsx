import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Page, Article, Author, NovusMessage } from './types';
import { getArticles, getTrendingArticles } from './api/cms';
import { GoogleGenAI } from '@google/genai';
import { Helmet } from 'react-helmet-async';

import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Admin from './pages/Admin';
import ArticlePage from './components/articles/ArticlePage';
import AuthorPage from './components/author/AuthorPage';
import Chatbot from './components/Chatbot';
import BackToTop from './components/BackToTop';
import SEO from './components/SEO';

/**
 * App Component
 * 
 * The root component of the application. It manages global state (articles, 
 * active page, search query, chatbot messages) and handles routing between 
 * the Home page, Article pages, and Author pages.
 */
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
        { id: 0, source: 'model', text: "Welcome to Novus Intelligence. How can I assist your investigation today?" }
    ]);

    const navigate = useNavigate();
    const location = useLocation();

    // Fetch articles on mount
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

    // Handle search query filtering and auto-scroll to results
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
        
        // Auto-scroll to articles when searching on Home page
        if (searchQuery.length >= 2) {
            if (location.pathname !== '/') {
                navigate('/');
                setTimeout(() => handleNavClick(Page.Articles), 100);
            } else if (activePage !== Page.Articles) {
                // If already on home but not at articles section, scroll there
                handleNavClick(Page.Articles);
            }
        }
    }, [searchQuery, regularArticles, trendingArticles, location.pathname, navigate, activePage]);

    /**
     * Handles navigation clicks from the Header or other components.
     * Scrolls to the appropriate section on the Home page or navigates
     * back to Home if currently on an Article/Author page.
     */
    const handleNavClick = (page: Page) => {
        setActivePage(page);

        if (page === Page.Article || page === Page.Author) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setSelectedArticle(null);
        setSelectedAuthor(null);
        
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(page);
                if (element) {
                    const headerOffset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }, 100);
        } else {
            const element = document.getElementById(page);
            if (element) {
                const headerOffset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        }
    };

    /**
     * Navigates to the selected article's page.
     */
    const handleSelectArticle = (article: Article) => {
        setSelectedArticle(article);
        navigate(`/articles/${article.id}`);
        window.scrollTo(0, 0);
    };

    /**
     * Navigates to the selected author's profile page.
     */
    const handleSelectAuthor = (author: Author) => {
        setSelectedAuthor(author);
        navigate(`/authors/${author.id}`);
        window.scrollTo(0, 0);
    };

    /**
     * Navigates back to the Home page and clears selections.
     */
    const handleBackToHome = () => {
        navigate('/');
        setSelectedArticle(null);
        setSelectedAuthor(null);
    };

    /**
     * Handles sending messages to the AI Chatbot (Novus).
     */
    const handleChatbotSendMessage = async (message: string) => {
        const userMessage: NovusMessage = { id: Date.now(), source: 'user', text: message };
        const loadingMessage: NovusMessage = { id: Date.now() + 1, source: 'model', isLoading: true };
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: message,
                config: { 
                    systemInstruction: `You are Novus, the AI research assistant for Novus Exchange. 

                    CRITICAL IDENTITY: Novus Exchange is a next-generation GLOBAL MEDIA AND NEWS platform. 
                    We are dedicated to investigative journalism, geopolitical analysis, and economic insights.

                    WHAT WE ARE NOT: 
                    - We are NOT a health insurance company.
                    - We are NOT an employee benefits software provider.
                    - We are NOT a cryptocurrency exchange or trading platform.

                    Your Purpose: To uncover the truth behind complex global issues and provide deep, data-driven analysis for our readers.
                    Founder: Marcio Novus.
                    Tone: Professional, intelligent, investigative, and forward-thinking.

                    The Novus Ecosystem includes:
                    1. Media Hub: End-to-end investigative platform for data and intelligence gathering.
                    2. ContentFlow PRO: Low-latency creator workstation for high-fidelity investigative content.
                    3. Content Hub CMS: A headless, AI-powered CMS designed for modern, high-traffic newsrooms.
                    4. Novus OS: Enterprise-grade governance and security framework for large-scale media operations.

                    Always provide helpful, accurate information and refer to the Novus mission (investigative truth) when relevant.
                    
                    FORMATTING RULE: 
                    - DO NOT use markdown formatting. 
                    - DO NOT use hashes (#) for headers. 
                    - DO NOT use bold (**) or italics (*). 
                    - DO NOT use bullet points with symbols.
                    - Respond in PLAIN, CLEAN TEXT. Use standard capitalization and paragraph spacing only.`
                }
            });
            const modelResponse: NovusMessage = { id: Date.now() + 2, source: 'model', text: response.text || "No response" };
            setMessages(prev => [...prev.slice(0, -1), modelResponse]);
        } catch (error: any) {
            console.error("Chatbot Error:", error);
            setMessages(prev => [...prev.slice(0, -1), { id: Date.now(), source: 'model', text: `I'm sorry, I'm having trouble connecting right now. Error: ${error.message}` }]);
        }
    };

    return (
        <div className="bg-black text-gray-100 font-sans selection:bg-red-600 selection:text-white flex flex-col items-center">
            <SEO />
            <div className="fixed top-0 left-0 w-full h-full bg-[#030303] z-0"></div>
            <Layout activePage={activePage} onNavClick={handleNavClick} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
                <div className="w-full flex flex-col items-center">
                    <Routes>
                        <Route path="/" element={<Home onNavClick={handleNavClick} activePage={activePage} setActivePage={setActivePage} searchQuery={searchQuery} />} />
                        <Route path="/admin" element={<Admin />} />
                        <Route path="/articles/:slug" element={
                            selectedArticle ? (
                                <ArticlePage 
                                    article={selectedArticle} 
                                    articles={[...regularArticles, ...trendingArticles]} 
                                    onBack={handleBackToHome} 
                                    onSelectArticle={handleSelectArticle} 
                                    onSelectAuthor={handleSelectAuthor} 
                                    onAskNovusHighlight={() => {}} 
                                />
                            ) : (
                                <div className="pt-32 text-center text-white">Article not found or loading...</div>
                            )
                        } />
                        <Route path="/authors/:slug" element={
                            selectedAuthor ? (
                                <AuthorPage 
                                    author={selectedAuthor} 
                                    articles={[...regularArticles, ...trendingArticles].filter(a => a.author.id === selectedAuthor.id)} 
                                    onBack={handleBackToHome} 
                                    onSelectArticle={handleSelectArticle} 
                                />
                            ) : (
                                <div className="pt-32 text-center text-white">Author not found or loading...</div>
                            )
                        } />
                    </Routes>
                </div>
            </Layout>
            <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} messages={messages} onSendMessage={handleChatbotSendMessage} />
            <BackToTop />
        </div>
    );
};

export default App;