import { useState, useEffect } from "react";
import { Page, Broadcast } from "../types";
import { getLatestBroadcast } from "../api/cms";

const CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const SplitFlapChar = ({ targetChar, delay }: { targetChar: string, delay: number }) => {
  const [currentChar, setCurrentChar] = useState(() => CHARS[Math.floor(Math.random() * 26) + 1]);
  
  useEffect(() => {
    const target = targetChar.toUpperCase();
    if (target === ' ') {
      setCurrentChar(' ');
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;
    
    timeout = setTimeout(() => {
      let flips = 0;
      const minFlips = 5 + Math.floor(Math.random() * 5);
      let currentIdx = Math.floor(Math.random() * CHARS.length);

      interval = setInterval(() => {
        flips++;
        currentIdx = (currentIdx + 1) % CHARS.length;
        const nextChar = CHARS[currentIdx];

        if (flips >= minFlips && nextChar === target) {
          setCurrentChar(target);
          clearInterval(interval);
        } else {
          setCurrentChar(nextChar);
        }
      }, 40);
    }, delay);
    
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [targetChar, delay]);

  return (
    <span className="inline-block" style={{ minWidth: targetChar === ' ' ? '0.3em' : 'auto' }}>
      {currentChar}
    </span>
  );
};

const SplitFlapText = ({ text, className }: { text: string, className?: string }) => {
  return (
    <span className={`inline-flex ${className || ''}`}>
      {text.split('').map((char, i) => (
        <SplitFlapChar key={i} targetChar={char} delay={i * 80} />
      ))}
    </span>
  );
};

interface HeroSectionProps {
  /** Callback function triggered when the primary call-to-action button is clicked */
  onNavClick: (page: Page) => void;
}

const BroadcastCard = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [broadcast, setBroadcast] = useState<Broadcast | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBroadcast = async () => {
      const data = await getLatestBroadcast();
      setBroadcast(data);
      setIsLoading(false);
    };
    fetchBroadcast();
  }, []);

  if (isLoading || !broadcast) {
    return (
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl h-[480px] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-red-600/10 to-transparent">
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={`w-1 h-3 bg-red-500 rounded-full ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
          <span className="text-red-500 text-[11px] font-black tracking-[0.2em] uppercase">The Briefing</span>
        </div>
        <span className="text-gray-500 text-[9px] font-bold tracking-widest uppercase">{broadcast.schedule}</span>
      </div>
      
      <div className="relative h-[280px] w-full overflow-hidden group cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying && broadcast.videoUrl ? (
          <video 
            src={broadcast.videoUrl} 
            className="w-full h-full object-cover"
            autoPlay
            controls
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <>
            <img 
              src={broadcast.thumbnailUrl} 
              alt="Briefing Visual" 
              className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-110' : 'group-hover:scale-105'}`}
            />
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${isPlaying ? 'scale-0 opacity-0' : 'bg-red-600 scale-100 opacity-100 shadow-[0_0_40px_rgba(220,38,38,0.5)] active:scale-95'}`}
                aria-label="Play Broadcast"
              >
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>

            <div className="absolute top-4 left-4 flex gap-2">
              <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                Latest Episode
              </span>
              <span className="bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                NotebookLM
              </span>
            </div>
            
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">Broadcasting</span>
            </div>
          </>
        )}
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 font-mono">
          <span className="text-red-400 font-bold uppercase tracking-wider">{broadcast.date}</span>
          <span>•</span>
          <span>{broadcast.duration} min briefing</span>
        </div>
        
        <h3 className="text-2xl font-bold text-white leading-tight mb-3">
          {broadcast.title}
        </h3>
        
        <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
          {broadcast.description}
        </p>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            {broadcast.tags.map(tag => (
              <span key={tag} className="text-[10px] text-gray-500 border border-white/10 px-2 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
          
          <button className="text-red-500 text-xs font-bold uppercase tracking-wider hover:text-red-400 transition-colors flex items-center gap-1 group/btn">
            View Analysis
            <svg className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * HeroSection Component
 * 
 * Renders the main landing area of the home page. It features a split-flap 
 * animated headline, a call-to-action button to explore articles, a link to 
 * the YouTube channel, and a featured article preview card.
 */
export default function HeroSection({ onNavClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-28 pb-32 overflow-hidden w-full">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-black z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Text Content */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="flex gap-1">
              <div className="w-1.5 h-6 bg-red-600 rounded-sm" />
              <div className="w-1.5 h-6 bg-red-600/60 rounded-sm" />
              <div className="w-1.5 h-6 bg-red-600/30 rounded-sm" />
            </div>
            <span className="text-red-500 text-xs font-bold tracking-[0.25em] uppercase">
              Investigative Media Platform
            </span>
            <div className="h-px w-16 bg-red-600/30 ml-2" />
          </div>

          <h1 className="text-[50px] md:text-[62px] lg:text-[70px] font-black text-white tracking-tighter leading-[0.95] mb-6">
            <SplitFlapText text="CUT THROUGH" /><br />
            <SplitFlapText text="THE " /><SplitFlapText text="NOISE" className="shimmer-red drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" /><br />
            <SplitFlapText text="STAY" /><br />
            <SplitFlapText text="INFORMED" className="shimmer-red drop-shadow-[0_0_25px_rgba(220,38,38,0.6)]" />
          </h1>

          <div className="h-0.5 w-full max-w-md bg-gradient-to-r from-red-600 via-red-600/50 to-transparent mb-8" />

          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl mb-10">
            Critical, clear-eyed commentary on the complex issues shaping our global landscape.{" "}
            <span className="text-white font-semibold">We challenge the narrative, so you don't have to.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => onNavClick(Page.Articles)}
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white font-bold text-xs tracking-widest uppercase rounded-lg hover:bg-white/10 hover:border-white/20 transition-all"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Explore Analysis
            </button>
            <a 
              href="https://www.youtube.com/@novusexchange" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-2 px-10 py-3 bg-red-600 text-white font-black text-xs tracking-[0.2em] uppercase rounded-lg hover:bg-red-700 transition-all shadow-[0_10px_20px_-10px_rgba(220,38,38,0.5)] active:scale-[0.98]"
            >
              <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.8 8s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-.9C16.4 5 12 5 12 5s-4.4 0-7 .1c-.4.1-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.5 2 11v1.5c0 1.5.2 3 .2 3s.2 1.4.8 2c.8.8 1.8.8 2.2.9C6.6 18.5 12 18.5 12 18.5s4.4 0 7-.2c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.5.2-3V11c0-1.5-.2-3-.2-3zM9.7 14.5V9l5.4 2.8-5.4 2.7z" />
              </svg>
              <span className="text-[9px] tracking-[0.3em]">NovusExchange</span>
            </a>
          </div>
        </div>

        {/* Right Column - Featured Broadcast Card */}
        <div className="relative hidden lg:block">
          <div className="absolute -top-6 -right-6 w-full h-full border border-white/5 rounded-2xl" />
          <div className="absolute -bottom-6 -left-6 w-full h-full border border-red-500/10 rounded-2xl" />
          
          <BroadcastCard />
        </div>
      </div>

      {/* Bottom Stats Bar */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-black/50 backdrop-blur-md z-20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-center">
          <button 
            className="flex flex-col items-center gap-2 cursor-pointer group outline-none focus:ring-2 focus:ring-red-500/50 rounded-lg px-4 py-1"
            onClick={() => onNavClick(Page.Mission)}
          >
            <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em] group-hover:text-white transition-colors">Scroll to Explore</span>
            <div className="w-5 h-8 border border-white/10 rounded-full flex justify-center p-1 group-hover:border-white/30 transition-colors">
              <div className="w-1 h-2 bg-red-600 rounded-full animate-bounce" />
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}
