import { useState, useEffect } from "react";
import { subscribeToNewsletter, getTrendingArticles } from "../api/cms";
import { Article } from "../types";

/**
 * TrendingSection Component
 * 
 * Renders the "Trending Now" section of the home page. It displays a list of 
 * the most popular articles and includes a newsletter subscription form.
 */
export default function TrendingSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [trending, setTrending] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await getTrendingArticles();
        setTrending(data);
      } catch (error) {
        console.error("Failed to load trending articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    const result = await subscribeToNewsletter(email);
    
    if (result.success) {
      setStatus("success");
      setEmail("");
    } else {
      console.error("Subscription failed:", result.error);
      setStatus("idle");
    }
    
    if (result.success) {
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <section id="trending" className="py-24 bg-[#050505] relative w-full">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-5 gap-16 lg:gap-12">
          
          {/* Left Column: Trending List */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-px w-8 bg-red-600" />
              <span className="text-red-500 text-xs font-bold tracking-[0.25em] uppercase">
                What's Hot
              </span>
            </div>
            
            <h2 className="text-4xl font-black text-white tracking-tight mb-10">
              Trending Now
            </h2>

            {isLoading ? (
               <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {trending.map((article, index) => (
                  <a 
                    key={article.id} 
                    href={article.sourceUrl || (article.content.includes('[Read full article]') ? article.content.split('](')[1].slice(0, -1) : '#')}
                    target={ (article.sourceUrl || article.content.includes('[Read full article]')) ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="group flex items-start gap-6 p-4 -ml-4 rounded-xl hover:bg-white/[0.03] transition-colors"
                  >
                    <span className="text-4xl font-black text-white/10 group-hover:text-white/20 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-gray-500 text-[10px] font-bold tracking-widest uppercase">
                          {article.category}
                        </span>
                        <span className="flex items-center gap-1 text-red-500 text-[10px] font-bold tracking-wider uppercase bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          Live
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-white group-hover:text-red-400 transition-colors leading-snug mb-2">
                        {article.title}
                      </h3>
                    </div>
                    
                    <div className="hidden sm:flex flex-col items-end pt-1">
                      <span className="text-white font-bold">{3 + index}k views</span>
                      <span className="text-gray-600 text-xs">{article.date}</span>
                    </div>
                    
                    <div className="pt-2 sm:hidden">
                      <svg className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Newsletter Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-32 bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-500/30 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                
                <h3 className="text-2xl font-black text-white tracking-tight mb-3">
                  Don't Miss a Story
                </h3>
                
                <p className="text-gray-400 text-sm leading-relaxed mb-8">
                  Get the week's most important investigative pieces delivered to your inbox. No spam — ever.
                </p>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" 
                      required
                      disabled={status !== "idle"}
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-all disabled:opacity-50"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={status !== "idle"}
                    className={`w-full font-bold text-sm tracking-widest uppercase py-4 rounded-lg transition-all shadow-[0_0_15px_rgba(230,33,23,0.2)] flex items-center justify-center gap-2 ${
                      status === "success" 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-[#e62117] hover:bg-[#c41c13]"
                    } disabled:opacity-70`}
                  >
                    {status === "idle" && "Subscribe Free"}
                    {status === "loading" && (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </>
                    )}
                    {status === "success" && (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        Welcome to Novus
                      </>
                    )}
                  </button>
                </form>
                
                <div className="mt-6 text-center">
                  <p className="text-gray-500 text-xs">
                    Join <span className="text-white font-bold">10,000+</span> readers · Unsubscribe anytime
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    SSL Secure
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-white rounded-sm" />
                    Weekly
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    No Spam
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
