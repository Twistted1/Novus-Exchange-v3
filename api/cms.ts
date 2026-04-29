import { Article, Author, Broadcast, PodcastEpisode } from '../types';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../lib/supabase';

// Initialize Gemini for automated script generation
// Note: Using process.env as per platform instructions for the Gemini API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

/**
 * Headless CMS Integration
 * 
 * Connected to Supabase backend.
 */
const marcioNovus: Author = {
  id: 'marcio-novus',
  name: 'Marcio Novus',
  avatarUrl: 'https://picsum.photos/seed/marcio/200/200',
  bio: 'Marcio Novus is an investigative journalist and founder of Novus Exchange, dedicated to uncovering the truth behind complex global issues.'
};

const allArticles: Article[] = [
  {
    id: 1,
    title: 'Is AI Disproportionately Impacting Women\'s Jobs?',
    excerpt: 'AI is disproportionately impacting the women\'s job market, with recent research showing women\'s jobs are much more likely to be automated or radically transformed by AI...',
    content: `Is AI taking over women's job market?\n\nAI is disproportionately impacting the women's job market, with recent research showing women’s jobs are much more likely to be automated or radically transformed by AI than men’s roles, especially in high-income countries.\n\n**Women's Jobs at Greater Risk**\nThe UN's Gender Snapshot 2025 report estimates that 28% of women's jobs worldwide are at risk of automation from AI, compared to 21% of men's roles.`,
    imageUrl: 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?q=80&w=2000&auto=format&fit=crop',
    category: 'Economics',
    author: marcioNovus,
    date: 'Oct 26, 2023',
    readTime: 5,
    tags: ['AI', 'Economics']
  },
  {
    id: 4,
    title: 'The UK\'s New Digital ID: Convenience vs. Surveillance',
    excerpt: 'The UK government is set to introduce a new digital identity (ID) scheme, often dubbed "BritCard," with a planned rollout to all UK citizens and legal residents by July 2029...',
    content: `The UK government is set to introduce a new digital identity (ID) scheme, often dubbed "BritCard," with a planned rollout to all UK citizens and legal residents by July 2029.`,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2000&auto=format&fit=crop',
    category: 'Geopolitics',
    author: marcioNovus,
    date: 'Oct 24, 2023',
    readTime: 4,
    tags: ['Privacy', 'Surveillance']
  },
  {
    id: 5,
    title: 'The Evolution of Corporate Social Responsibility',
    excerpt: 'Explore how modern corporations are integrating social and environmental concerns into their business operations. This article delves into the importance of CSR...',
    content: `Explore how modern corporations are integrating social and environmental concerns into their business operations.`,
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop',
    category: 'Media',
    author: marcioNovus,
    date: 'Oct 22, 2023',
    readTime: 6,
    tags: ['CSR', 'Business']
  },
];

const CMS_LATENCY = 800; 

export const getArticles = async (): Promise<Article[]> => {
    try {
        console.log("Supabase: Fetching articles...");
        const { data, error, status } = await supabase
            .from('articles')
            .select('*, author:authors(*)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase Error:", error.message, "Code:", error.code, "Status:", status);
            return allArticles; // Fallback to mock
        }

        console.log("Supabase Data Received:", data);

        if (data && data.length > 0) {
            return data.map(item => {
                // Ensure we have a valid date string
                let displayDate = item.publish_date;
                if (!displayDate && item.created_at) {
                    displayDate = new Date(item.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                }
                if (!displayDate || displayDate === 'Invalid Date') {
                    displayDate = new Date().toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    });
                }

                return {
                    id: item.id,
                    title: item.title || 'Untitled Article',
                    excerpt: item.excerpt || '',
                    content: item.content || '',
                    imageUrl: item.image_url || 'https://picsum.photos/seed/novus/1200/800',
                    category: item.category || 'Political Commentary',
                    author: item.author || marcioNovus,
                    date: displayDate,
                    readTime: item.read_time || 5,
                    tags: item.tags || []
                };
            });
        } else {
            console.warn("Supabase: No articles found in table.");
        }
    } catch (err) {
        console.error("Unexpected Fetch Error:", err);
    }
    
    // Fallback if no data or error
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(allArticles)));
        }, CMS_LATENCY);
    });
};

/**
 * Newsletter Subscriptions
 */
export const subscribeToNewsletter = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase
            .from('subscribers')
            .insert([{ email, created_at: new Date().toISOString() }]);

        if (error) {
            console.error("Supabase error subscribing:", error);
            // Handle unique constraint if email already exists
            if (error.code === '23505') {
                return { success: true }; // Treat as success if already subscribed
            }
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        console.error("Unexpected error subscribing:", err);
        return { success: false, error: err.message };
    }
};

/**
 * Diagnostic Tools
 */
export const testSupabaseConnection = async (): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase.from('articles').select('id').limit(1);
        if (error) {
            if (error.code === '42P01') {
                return { success: false, error: "Table 'articles' not found. Ensure tables are created." };
            }
            return { success: false, error: error.message };
        }
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
};

/**
 * AI-Powered Trending Engine
 * Uses Gemini with Google Search to fetch real-time news as of today.
 */
const aiPoweredNovus: Author = {
  id: 'ai-powered-novus',
  name: 'AI-Powered Novus',
  avatarUrl: 'https://storage.googleapis.com/a1aa/image/f6f09918-6204-4533-8581-22467d383963.jpeg',
  bio: 'Our proprietary AI research engine, processing real-time global data to provide instant geopolitical and economic insights.'
};

export const getTrendingArticles = async (): Promise<Article[]> => {
    try {
        // Alternative: Fetching real live news from a public RSS feed (e.g., BBC World News)
        // using a free RSS-to-JSON converter. No API key required!
        const rssUrl = 'http://feeds.bbci.co.uk/news/world/rss.xml';
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data && data.status === 'ok' && data.items && data.items.length > 0) {
            // Take the top 3 trending articles
            const topItems = data.items.slice(0, 3);
            
            return topItems.map((item: any, index: number) => {
                // Extract image from description if available, otherwise use a fallback
                let imageUrl = 'https://images.unsplash.com/photo-1611974714013-3c8c0d088bd3?q=80&w=2000&auto=format&fit=crop';
                if (item.thumbnail) {
                    imageUrl = item.thumbnail;
                } else if (item.enclosure && item.enclosure.link) {
                    imageUrl = item.enclosure.link;
                }

                // Clean up HTML tags from description for the excerpt
                const cleanExcerpt = item.description.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

                // Robust date parsing
                let pubDate = 'Recently';
                try {
                    const parsed = new Date(item.pubDate);
                    if (!isNaN(parsed.getTime())) {
                        pubDate = parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    }
                } catch (e) {
                    console.error("Date parsing failed for trending item:", e);
                }

                return {
                    id: 2000 + index,
                    title: item.title,
                    excerpt: cleanExcerpt,
                    content: `### ${item.title}\n\n${cleanExcerpt}\n\n[Read full article](${item.link})`,
                    sourceUrl: item.link,
                    imageUrl: imageUrl,
                    category: 'Global News',
                    author: {
                        id: 'live-feed',
                        name: 'Live Global Feed',
                        avatarUrl: 'https://ui-avatars.com/api/?name=Live+Feed&background=0D8ABC&color=fff',
                        bio: 'Real-time news aggregated from global sources.'
                    },
                    date: pubDate,
                    readTime: 3,
                    tags: ['LIVE', 'World News', 'Trending']
                };
            });
        }
    } catch (error) {
        console.error("Error fetching trending articles from RSS:", error);
    }

    // Fallback to mock data if RSS fails
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1000,
                    title: 'Global Supply Chains Face New Pressures Amidst Geopolitical Shifts',
                    excerpt: 'Ongoing conflicts and shifting alliances continue to disrupt global trade routes, energy markets, and critical supply chains, forcing multinational corporations to rethink their strategies.',
                    content: `### Global Supply Chains Under Pressure\n\nOngoing conflicts and shifting alliances continue to disrupt global trade routes, energy markets, and critical supply chains, forcing multinational corporations to rethink their strategies.\n\n**Key Disruptions**\nRecent geopolitical events have led to significant bottlenecks in major shipping lanes. Companies are increasingly moving away from "just-in-time" manufacturing towards "just-in-case" inventory models.\n\n- Increased freight costs\n- Delayed shipments of critical components\n- A push for nearshoring and friendshoring\n\n**Economic Impact**\nThe ripple effects are being felt across the global economy, contributing to inflationary pressures and forcing central banks to maintain higher interest rates for longer than anticipated.`,
                    imageUrl: 'https://images.unsplash.com/photo-1611974714013-3c8c0d088bd3?q=80&w=2000&auto=format&fit=crop',
                    category: 'Economics',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 5,
                    tags: ['LIVE-ANALYSIS', 'Geopolitics', 'Economy', 'Trending']
                },
                {
                    id: 1001,
                    title: 'The Rise of Eco-Nationalism in Climate Policy',
                    excerpt: 'As the effects of climate change become more pronounced, a new political trend is emerging: eco-nationalism. Countries are increasingly tying environmental protection to national identity and security.',
                    content: `### The Emergence of Eco-Nationalism\n\nAs the effects of climate change become more pronounced, a new political trend is emerging: eco-nationalism. Countries are increasingly tying environmental protection to national identity and security.\n\n**Protectionist Green Policies**\nGovernments are implementing policies that favor domestic green industries, often at the expense of international cooperation. This includes subsidies for local renewable energy manufacturing and tariffs on imported green technology.\n\n- Subsidies for domestic EV production\n- Carbon border adjustment mechanisms\n- Export restrictions on critical minerals\n\n**Global Ramifications**\nWhile these policies may accelerate the green transition locally, they risk sparking trade wars and hindering the global effort to combat climate change by making green technologies more expensive overall.`,
                    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2000&auto=format&fit=crop',
                    category: 'Geopolitics',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 6,
                    tags: ['LIVE-ANALYSIS', 'Climate', 'Politics', 'Trending', 'Eco']
                },
                {
                    id: 1002,
                    title: 'Central Bank Digital Currencies (CBDCs) Enter Testing Phase',
                    excerpt: 'Several major economies have officially moved their Central Bank Digital Currency (CBDC) projects from the research phase to active pilot testing, signaling a major shift in the future of money.',
                    content: `### The Future of Money: CBDCs\n\nSeveral major economies have officially moved their Central Bank Digital Currency (CBDC) projects from the research phase to active pilot testing, signaling a major shift in the future of money.\n\n**Pilot Programs Underway**\nCentral banks are testing the feasibility of digital currencies for both wholesale (interbank) and retail (public) use. These pilots aim to evaluate the technology's impact on financial stability and monetary policy.\n\n- Enhanced cross-border payment efficiency\n- Programmable money capabilities\n- Concerns regarding privacy and state surveillance\n\n**The Road Ahead**\nThe widespread adoption of CBDCs could fundamentally alter the global financial system, potentially challenging the dominance of the US dollar and traditional commercial banking models.`,
                    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000&auto=format&fit=crop',
                    category: 'Media',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 4,
                    tags: ['LIVE-ANALYSIS', 'Finance', 'Technology', 'Trending']
                }
            ]);
        }, CMS_LATENCY);
    });
};

export const getAuthor = (id: string): Promise<Author | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (id === 'marcio-novus') {
                resolve(JSON.parse(JSON.stringify(marcioNovus)));
            } else if (id === 'ai-powered-novus') {
                resolve(JSON.parse(JSON.stringify(aiPoweredNovus)));
            } else {
                resolve(undefined);
            }
        }, CMS_LATENCY);
    });
};

/**
 * Automated Broadcast System
 */

export const getLatestBroadcast = async (): Promise<Broadcast> => {
    const fallback: Broadcast = {
        id: 'latest-briefing-unreliable-ally',
        title: "An Unreliable Ally: The New Global Landscape",
        description: "An investigative briefing on the shifting power balance between the United States and China, and the strategic dilemma facing middle-power allies.",
        duration: "7:22",
        date: "TUE Apr 28, 2026",
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        videoUrl: "/broadcast_april_28.mp4",
        tags: ["Geopolitics", "US-China", "Intelligence"],
        schedule: "MON • WED • SAT"
    };

    try {
        const { data, error } = await supabase
            .from('broadcasts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.warn("Supabase: Error fetching latest broadcast, using fallback.");
            return fallback;
        }

        if (data) {
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                date: data.publish_date || new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                thumbnailUrl: data.thumbnail_url || fallback.thumbnailUrl,
                videoUrl: data.video_url,
                audioUrl: data.audio_url,
                duration: data.duration || "5:00",
                tags: data.tags || [],
                schedule: data.schedule || "MON • WED • SAT"
            };
        }
    } catch (err) {
        console.error("Unexpected error fetching broadcast:", err);
    }

    return fallback;
};

export const getAuthors = async (): Promise<Author[]> => {
    try {
        const { data, error } = await supabase
            .from('authors')
            .select('*');
        
        if (error) return [marcioNovus];
        return data || [marcioNovus];
    } catch (err) {
        return [marcioNovus];
    }
};

export const publishArticle = async (articleData: Partial<Article>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { data, error } = await supabase
            .from('articles')
            .insert([{
                title: articleData.title,
                excerpt: articleData.excerpt,
                content: articleData.content,
                image_url: articleData.imageUrl,
                category: articleData.category,
                author_id: (articleData.author as any)?.id || 'marcio-novus',
                tags: articleData.tags,
                read_time: articleData.readTime || 5,
                publish_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error("Error publishing article:", err);
        return { success: false, error: err.message };
    }
};

export const generateBroadcastScript = async (): Promise<string> => {
    try {
        const trending = await getTrendingArticles();
        const topics = trending.map(a => `- ${a.title}: ${a.excerpt}`).join('\n');

        const prompt = `
            You are the Lead Anchor for Novus Intelligence. 
            Generate a concise, professional, and investigative news briefing script for a podcast/video segment.
            This script will be used as a "source text" for NotebookLM to generate a conversational dialogue.
            
            TODAY'S TOP DISRUPTIONS:
            ${topics}
            
            MISSION: 
            Deconstruct these headlines. Look for the "hidden architecture" behind them. 
            How do these events impact global power, economic stability, or individual privacy?
            
            TONE: 
            Intense, intellectual, and slightly provocative. Avoid generic news tropes.
            
            FORMATTING:
            Provide a clean script with:
            1. An "Intro Hook" (Establishing the stakes)
            2. "The Investigation" (Deep dive into the topics)
            3. "The Outlook" (What happens next?)
            
            Do not use markdown formatting characters (hashes, bolding, etc.). Plain text only.
        `;

        const result = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt
        });
        return result.text || "System error: Unable to synthesize briefing at this time.";
    } catch (err) {
        console.error("Error generating broadcast script:", err);
        return "System error: Unable to synthesize briefing at this time.";
    }
};

/**
 * Podcast Management System
 */

export const getLatestPodcastEpisode = async (): Promise<PodcastEpisode> => {
    const fallback: PodcastEpisode = {
        id: 'ep-042-fallback',
        title: "The Decentralised Mirror of Power",
        description: "An deep dive into how technological decentralisation is shifting the core of geopolitical power.",
        date: "Apr 28, 2026",
        episodeNumber: 42,
        season: 4,
        audioUrl: "#",
        thumbnailUrl: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2070&auto=format&fit=crop",
        duration: "52:14",
        tags: ["Power", "Technology", "Decentralisation"]
    };

    try {
        const { data, error } = await supabase
            .from('podcasts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            console.warn("Supabase: Error fetching latest podcast, using fallback.");
            return fallback;
        }

        if (data) {
            return {
                id: data.id,
                title: data.title,
                description: data.description,
                date: data.publish_date || new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                episodeNumber: data.episode_number,
                season: data.season,
                audioUrl: data.audio_url,
                thumbnailUrl: data.thumbnail_url || fallback.thumbnailUrl,
                duration: data.duration,
                tags: data.tags || []
            };
        }
    } catch (err) {
        console.error("Unexpected error fetching podcast:", err);
    }

    return fallback;
};

export const publishPodcastEpisode = async (episodeData: Partial<PodcastEpisode>): Promise<{ success: boolean; error?: string }> => {
    try {
        const { error } = await supabase
            .from('podcasts')
            .insert([{
                title: episodeData.title,
                description: episodeData.description,
                episode_number: episodeData.episodeNumber,
                season: episodeData.season,
                audio_url: episodeData.audioUrl,
                thumbnail_url: episodeData.thumbnailUrl,
                duration: episodeData.duration,
                tags: episodeData.tags,
                publish_date: episodeData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;
        return { success: true };
    } catch (err: any) {
        console.error("Error publishing podcast episode:", err);
        return { success: false, error: err.message };
    }
};
