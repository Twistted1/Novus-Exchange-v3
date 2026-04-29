import { useState, useEffect, useMemo } from "react";
import { getArticles } from "../api/cms";
import { Article, Author } from "../types";

const marcioNovus: Author = {
  id: 'marcio-novus',
  name: 'Marcio Novus',
  avatarUrl: 'https://picsum.photos/seed/marcio/200/200',
  bio: 'Marcio Novus is an investigative journalist and founder of Novus Exchange.'
};

const fallbackArticles: (Article & { color?: string })[] = [
  {
    id: 1,
    category: "Geopolitics",
    title: "The Silent Reshaping of the Indo-Pacific: What the Headlines Miss",
    excerpt: "Beyond the surface tensions, a deeper strategic realignment is underway.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=2000",
    author: marcioNovus,
    readTime: 11,
    date: "Jun 12, 2025",
    tags: ["China", "ASEAN", "Strategy"],
    color: "#dc2626",
  },
  {
    id: 2,
    category: "Economics",
    title: "De-Dollarization Is Real — Here's the Data They're Not Showing You",
    excerpt: "The narrative dismissing BRICS currency moves is crumbling.",
    content: "Full content here...",
    imageUrl: "https://images.unsplash.com/photo-1611974714013-3c8c0d088bd3?q=80&w=2000",
    author: marcioNovus,
    readTime: 9,
    date: "Jun 10, 2025",
    tags: ["BRICS", "Dollar", "Finance"],
    color: "#ea580c",
  }
];

const categoryColors: Record<string, string> = {
  "Geopolitics": "#dc2626",
  "Economics": "#ea580c",
  "Technology": "#7c3aed",
  "Media": "#0891b2",
  "Climate": "#16a34a",
  "Security": "#b45309",
  "Global News": "#0D8ABC",
  "Economic Insights": "#ea580c",
  "Political Commentary": "#dc2626",
  "Social Responsibility": "#16a34a",
};

interface ExtendedArticle extends Article {
    color?: string;
}

function ArticleCard({ article, index }: { article: ExtendedArticle; index: number }) {
  const [hovered, setHovered] = useState(false);
  const color = article.color || categoryColors[article.category] || "#dc2626";

  return (
    <article
      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-400"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? color + "60" : "rgba(255,255,255,0.07)"}`,
        boxShadow: hovered ? `0 0 30px ${color}20, 0 8px 32px rgba(0,0,0,0.4)` : "0 2px 12px rgba(0,0,0,0.3)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Color accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, ${color}, transparent)`,
          opacity: hovered ? 1 : 0.4,
        }}
      />

      <div className="p-6">
        {/* Category + read time */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              color: color,
              background: color + "18",
            }}
          >
            {article.category}
          </span>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {article.readTime} min
            </span>
            <span>{article.date}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-white font-bold text-base leading-snug mb-3 transition-colors duration-200"
          style={{ color: hovered ? "white" : "rgba(255,255,255,0.9)" }}
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-2"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {article.excerpt}
        </p>

        {/* Tags + arrow */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="text-gray-500 text-xs px-2 py-0.5 rounded"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <svg
            className="w-4 h-4 transition-all duration-200 flex-shrink-0"
            style={{ color: article.color, transform: hovered ? "translateX(4px)" : "translateX(0)" }}
            fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
          >
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </article>
  );
}

/**
 * ArticlesSection Component
 * 
 * Renders the "Latest Articles" section of the home page. It displays a grid of 
 * article cards with category filtering and search capabilities.
 */
export default function ArticlesSection({ searchQuery }: { searchQuery: string }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [articles, setArticles] = useState<Article[]>(fallbackArticles);
  const [isLoading, setIsLoading] = useState(true);

  // Derive categories from current articles
  const dynamicCategories = ["All", ...Array.from(new Set(articles.map(a => a.category)))];

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const data = await getArticles();
        if (data && data.length > 0) {
          setArticles(data);
        }
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filtered = useMemo(() => {
    let result = articles;
    
    // Filter by Category
    if (activeCategory !== "All") {
      result = result.filter(a => a.category === activeCategory);
    }
    
    // Filter by Search
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter(a => 
        a.title.toLowerCase().includes(lowerQuery) || 
        a.excerpt.toLowerCase().includes(lowerQuery) ||
        a.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
        a.author.name.toLowerCase().includes(lowerQuery)
      );
    }
    
    return result;
  }, [articles, activeCategory, searchQuery]);

  return (
    <section id="articles" className="py-24 bg-black relative w-full">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-red-600" />
              <span className="text-red-500 text-xs font-bold tracking-[0.25em] uppercase">
                Deep Analysis
              </span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">
              Latest Articles
            </h2>
            <p className="text-gray-500 mt-2 max-w-md">
              Investigative reporting and in-depth analysis you won't find in mainstream media.
            </p>
          </div>

          {/* View all */}
          <a
            href="#articles"
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors group"
          >
            View all articles
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {dynamicCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase transition-all duration-200"
              style={{
                background: activeCategory === cat ? "#dc2626" : "rgba(255,255,255,0.06)",
                color: activeCategory === cat ? "white" : "rgba(255,255,255,0.5)",
                border: `1px solid ${activeCategory === cat ? "#dc2626" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}

        {/* Load more */}
        <div className="text-center mt-12">
          <button
            className="group px-8 py-3.5 rounded-lg font-bold text-sm tracking-widest uppercase text-white transition-all duration-300"
            style={{
              background: "rgba(220,38,38,0.1)",
              border: "1.5px solid rgba(220,38,38,0.4)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.2)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#dc2626";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.1)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220,38,38,0.4)";
            }}
          >
            Load More Articles
          </button>
        </div>
      </div>
    </section>
  );
}
