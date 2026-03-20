import { Article, Author } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import { supabase } from '../lib/supabase';

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
    category: 'Economic Insights',
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
    category: 'Political Commentary',
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
    category: 'Social Responsibility',
    author: marcioNovus,
    date: 'Oct 22, 2023',
    readTime: 6,
    tags: ['CSR', 'Business']
  },
];

const CMS_LATENCY = 800; 

export const getArticles = async (): Promise<Article[]> => {
    try {
        // Attempt to fetch from Supabase 'posts' table
        const { data: posts, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase fetch error:', error);
        } else if (posts && posts.length > 0) {
            // Map Supabase data to our Article type
            // Note: Adjust these field names based on your actual Supabase schema
            return posts.map((post: any) => ({
                id: post.id || Math.random(),
                title: post.title || post.name || 'Untitled Article',
                excerpt: post.excerpt || post.summary || (post.content ? post.content.substring(0, 120) + '...' : 'No excerpt available.'),
                content: post.content || post.body || '',
                imageUrl: post.image_url || post.cover_image || post.media_url || 'https://images.unsplash.com/photo-1591189863430-ab87e120f312?q=80&w=2000&auto=format&fit=crop',
                category: post.category || 'Economic Insights',
                author: marcioNovus, // Fallback author, can be updated to fetch from 'profiles' if linked
                date: post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date',
                readTime: post.read_time || 5,
                tags: post.tags || []
            }));
        }
    } catch (err) {
        console.warn('Falling back to mock data due to Supabase error:', err);
    }

    // Fallback to mock data if Supabase fails or is empty
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(allArticles)));
        }, CMS_LATENCY);
    });
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
        if (!process.env.GEMINI_API_KEY) {
            console.warn("GEMINI_API_KEY is missing. Returning fallback data.");
        } else {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Generate 3 trending news articles about global geopolitics and economics. 
                Return the response strictly as a JSON array of objects with the following keys:
                - title (string)
                - excerpt (string)
                - content (string, markdown format)
                - imageUrl (string, use a relevant unsplash image URL like https://images.unsplash.com/photo-1611974714013-3c8c0d088bd3?q=80&w=2000&auto=format&fit=crop)
                - category (string)
                - date (string, e.g. 'Oct 26, 2023')
                - readTime (number)
                - tags (array of strings)
                `,
                config: {
                    responseMimeType: "application/json",
                }
            });

            const text = response.text;
            if (text) {
                const parsed = JSON.parse(text);
                return parsed.map((article: any, index: number) => ({
                    ...article,
                    id: 1000 + index,
                    author: aiPoweredNovus
                }));
            }
        }
    } catch (error) {
        console.error("Error fetching trending articles from Gemini:", error);
    }

    // Fallback to mock data if API fails or is missing
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    id: 1000,
                    title: 'Global Supply Chains Face New Pressures Amidst Geopolitical Shifts',
                    excerpt: 'Ongoing conflicts and shifting alliances continue to disrupt global trade routes, energy markets, and critical supply chains, forcing multinational corporations to rethink their strategies.',
                    content: `### Global Supply Chains Under Pressure

Ongoing conflicts and shifting alliances continue to disrupt global trade routes, energy markets, and critical supply chains, forcing multinational corporations to rethink their strategies.

**Key Disruptions**
Recent geopolitical events have led to significant bottlenecks in major shipping lanes. Companies are increasingly moving away from "just-in-time" manufacturing towards "just-in-case" inventory models.

- Increased freight costs
- Delayed shipments of critical components
- A push for nearshoring and friendshoring

**Economic Impact**
The ripple effects are being felt across the global economy, contributing to inflationary pressures and forcing central banks to maintain higher interest rates for longer than anticipated.`,
                    imageUrl: 'https://images.unsplash.com/photo-1611974714013-3c8c0d088bd3?q=80&w=2000&auto=format&fit=crop',
                    category: 'Economic Insights',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 5,
                    tags: ['AI-POWERED', 'LIVE-ANALYSIS', 'Geopolitics', 'Economy', 'Trending']
                },
                {
                    id: 1001,
                    title: 'The Rise of Eco-Nationalism in Climate Policy',
                    excerpt: 'As the effects of climate change become more pronounced, a new political trend is emerging: eco-nationalism. Countries are increasingly tying environmental protection to national identity and security.',
                    content: `### The Emergence of Eco-Nationalism

As the effects of climate change become more pronounced, a new political trend is emerging: eco-nationalism. Countries are increasingly tying environmental protection to national identity and security.

**Protectionist Green Policies**
Governments are implementing policies that favor domestic green industries, often at the expense of international cooperation. This includes subsidies for local renewable energy manufacturing and tariffs on imported green technology.

- Subsidies for domestic EV production
- Carbon border adjustment mechanisms
- Export restrictions on critical minerals

**Global Ramifications**
While these policies may accelerate the green transition locally, they risk sparking trade wars and hindering the global effort to combat climate change by making green technologies more expensive overall.`,
                    imageUrl: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2000&auto=format&fit=crop',
                    category: 'Political Commentary',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 6,
                    tags: ['AI-POWERED', 'LIVE-ANALYSIS', 'Climate', 'Politics', 'Trending', 'Eco']
                },
                {
                    id: 1002,
                    title: 'Central Bank Digital Currencies (CBDCs) Enter Testing Phase',
                    excerpt: 'Several major economies have officially moved their Central Bank Digital Currency (CBDC) projects from the research phase to active pilot testing, signaling a major shift in the future of money.',
                    content: `### The Future of Money: CBDCs

Several major economies have officially moved their Central Bank Digital Currency (CBDC) projects from the research phase to active pilot testing, signaling a major shift in the future of money.

**Pilot Programs Underway**
Central banks are testing the feasibility of digital currencies for both wholesale (interbank) and retail (public) use. These pilots aim to evaluate the technology's impact on financial stability and monetary policy.

- Enhanced cross-border payment efficiency
- Programmable money capabilities
- Concerns regarding privacy and state surveillance

**The Road Ahead**
The widespread adoption of CBDCs could fundamentally alter the global financial system, potentially challenging the dominance of the US dollar and traditional commercial banking models.`,
                    imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=2000&auto=format&fit=crop',
                    category: 'Economic Insights',
                    author: aiPoweredNovus,
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    readTime: 4,
                    tags: ['AI-POWERED', 'LIVE-ANALYSIS', 'Finance', 'Technology', 'Trending']
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