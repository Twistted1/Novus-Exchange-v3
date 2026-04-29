import React, { useState, useEffect } from 'react';
import { generateBroadcastScript, publishArticle, getAuthors, publishPodcastEpisode } from '../api/cms';
import { Author } from '../types';

/**
 * Admin Component (Proprietary CMS)
 */
const Admin: React.FC = () => {
    // Broadcast Script States
    const [script, setScript] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copyStatus, setCopyStatus] = useState("Copy Script");

    // Article Publisher States
    const [authors, setAuthors] = useState<Author[]>([]);
    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState<"idle" | "success" | "error">("idle");
    const [articleData, setArticleData] = useState({
        title: "",
        excerpt: "",
        content: "",
        imageUrl: "https://images.unsplash.com/photo-1591189863430-ab87e120f312?q=80&w=2000&auto=format&fit=crop",
        category: "Political Commentary",
        authorId: "marcio-novus",
        tagsString: "AI, Economics, Global"
    });

    // Podcast Episode States
    const [isPodcastPublishing, setIsPodcastPublishing] = useState(false);
    const [podcastStatus, setPodcastStatus] = useState<"idle" | "success" | "error">("idle");
    const [podcastData, setPodcastData] = useState({
        title: "",
        description: "",
        episodeNumber: 43,
        season: 4,
        audioUrl: "https://storage.googleapis.com/novus-storage/podcasts/ep43.mp3",
        thumbnailUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2070&auto=format&fit=crop",
        duration: "45:00",
        tagsString: "Podcast, Investigation, Power"
    });

    useEffect(() => {
        const fetchAuthors = async () => {
            const data = await getAuthors();
            setAuthors(data);
        };
        fetchAuthors();
    }, []);

    const handleGenerate = async () => {
        setIsGenerating(true);
        const result = await generateBroadcastScript();
        setScript(result);
        setIsGenerating(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(script);
        setCopyStatus("Copied!");
        setTimeout(() => setCopyStatus("Copy Script"), 2000);
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPublishing(true);
        
        const tags = articleData.tagsString.split(',').map(t => t.trim());
        const selectedAuthor = authors.find(a => a.id === articleData.authorId) || authors[0];

        const result = await publishArticle({
            ...articleData,
            author: selectedAuthor,
            tags,
            readTime: Math.max(1, Math.ceil(articleData.content.split(' ').length / 200))
        });

        if (result.success) {
            setPublishStatus("success");
            setArticleData({
                title: "",
                excerpt: "",
                content: "",
                imageUrl: "https://images.unsplash.com/photo-1591189863430-ab87e120f312?q=80&w=2000&auto=format&fit=crop",
                category: "Political Commentary",
                authorId: "marcio-novus",
                tagsString: "AI, Economics, Global"
            });
            setTimeout(() => setPublishStatus("idle"), 3000);
        } else {
            setPublishStatus("error");
            setTimeout(() => setPublishStatus("idle"), 3000);
        }
        setIsPublishing(false);
    };

    const handlePodcastPublish = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsPodcastPublishing(true);
        
        const result = await publishPodcastEpisode({
            ...podcastData,
            tags: podcastData.tagsString.split(',').map(t => t.trim()),
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        });

        if (result.success) {
            setPodcastStatus("success");
            setPodcastData(prev => ({
                ...prev,
                title: "",
                description: "",
                episodeNumber: prev.episodeNumber + 1
            }));
            setTimeout(() => setPodcastStatus("idle"), 3000);
        } else {
            setPodcastStatus("error");
            setTimeout(() => setPodcastStatus("idle"), 3000);
        }
        setIsPodcastPublishing(false);
    };

    return (
        <div className="min-h-screen bg-black pt-28 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-3 mb-12">
                    <div className="w-2 h-8 bg-red-600 rounded-sm" />
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Novus Command</h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* LEFT: BROADCAST TOOLS */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
                            <h2 className="text-xl font-bold text-white mb-6 italic flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                Audio Synthesis
                            </h2>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest font-bold">Step 1: Intelligence Scan</p>
                                    <button 
                                        onClick={handleGenerate}
                                        disabled={isGenerating}
                                        className="w-full py-4 bg-red-600 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        {isGenerating ? "Synthesizing..." : "Generate Script"}
                                    </button>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs mb-4 uppercase tracking-widest font-bold">Step 2: External Finalization</p>
                                    <a 
                                        href="https://notebooklm.google.com/" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="block w-full py-4 border border-white/10 text-white text-center font-bold text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        NotebookLM Center
                                    </a>
                                </div>

                                {script && (
                                    <div className="pt-4 border-t border-white/5">
                                        <button 
                                            onClick={handleCopy}
                                            className="w-full text-red-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                                        >
                                            {copyStatus}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PODCAST MANAGER */}
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white italic">Podcast Studio</h2>
                                {podcastStatus === "success" && <span className="text-green-500 text-[8px] font-bold uppercase">Transmitted</span>}
                            </div>
                            
                            <form onSubmit={handlePodcastPublish} className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Episode Title</label>
                                    <input 
                                        required
                                        value={podcastData.title}
                                        onChange={e => setPodcastData({...podcastData, title: e.target.value})}
                                        className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-white text-xs focus:border-red-500 outline-none"
                                        placeholder="The Silk Road 2.0..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">S / Ep</label>
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                value={podcastData.season}
                                                onChange={e => setPodcastData({...podcastData, season: parseInt(e.target.value)})}
                                                className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                            />
                                            <input 
                                                type="number"
                                                value={podcastData.episodeNumber}
                                                onChange={e => setPodcastData({...podcastData, episodeNumber: parseInt(e.target.value)})}
                                                className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Duration</label>
                                        <input 
                                            value={podcastData.duration}
                                            onChange={e => setPodcastData({...podcastData, duration: e.target.value})}
                                            className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-white text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Audio Asset URL</label>
                                    <input 
                                        value={podcastData.audioUrl}
                                        onChange={e => setPodcastData({...podcastData, audioUrl: e.target.value})}
                                        className="w-full bg-black border border-white/5 rounded-lg px-3 py-2 text-white text-[10px]"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={isPodcastPublishing}
                                    className="w-full py-3 bg-white/5 border border-white/10 text-white font-bold text-[9px] uppercase tracking-[0.2em] rounded-lg hover:bg-red-600 hover:border-red-600 transition-all"
                                >
                                    {isPodcastPublishing ? "Syncing..." : "Sync Latest Episode"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* RIGHT: ARTICLE COMPOSER (PROPRIETARY CMS) */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 md:p-12">
                            <div className="flex items-center justify-between mb-10">
                                <h2 className="text-2xl font-bold text-white italic">Proprietary Headless CMS</h2>
                                {publishStatus === "success" && <span className="text-green-500 text-[10px] font-bold uppercase">Article Published</span>}
                                {publishStatus === "error" && <span className="text-red-500 text-[10px] font-bold uppercase">Publish Failed</span>}
                            </div>

                            <form onSubmit={handlePublish} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Headline</label>
                                        <input 
                                            required
                                            value={articleData.title}
                                            onChange={e => setArticleData({...articleData, title: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                            placeholder="The Architecture of Control..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Author Identity</label>
                                        <select 
                                            value={articleData.authorId}
                                            onChange={e => setArticleData({...articleData, authorId: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 appearance-none"
                                        >
                                            {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Intelligence Excerpt</label>
                                    <textarea 
                                        required
                                        value={articleData.excerpt}
                                        onChange={e => setArticleData({...articleData, excerpt: e.target.value})}
                                        className="w-full h-24 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-red-500 transition-colors"
                                        placeholder="A brief summary for the intelligence briefing..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Full Report Content (Markdown)</label>
                                    <textarea 
                                        required
                                        value={articleData.content}
                                        onChange={e => setArticleData({...articleData, content: e.target.value})}
                                        className="w-full h-80 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-colors"
                                        placeholder="### Detailed Investigation..."
                                    />
                                </div>

                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Category</label>
                                        <input 
                                            value={articleData.category}
                                            onChange={e => setArticleData({...articleData, category: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Tags (CSV)</label>
                                        <input 
                                            value={articleData.tagsString}
                                            onChange={e => setArticleData({...articleData, tagsString: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Visual Asset URL</label>
                                        <input 
                                            value={articleData.imageUrl}
                                            onChange={e => setArticleData({...articleData, imageUrl: e.target.value})}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isPublishing}
                                    className="w-full py-5 bg-white text-black font-black text-xs uppercase tracking-[0.3em] rounded-xl hover:bg-red-600 hover:text-white transition-all disabled:opacity-50"
                                >
                                    {isPublishing ? "Transmitting..." : "Initialize Publication"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {script && (
                    <div className="mt-12 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-white/5">
                            <span className="text-red-500 text-xs font-bold uppercase tracking-widest">NotebookLM Source Text Injection</span>
                        </div>
                        <div className="p-8">
                            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                                {script}
                            </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin;
