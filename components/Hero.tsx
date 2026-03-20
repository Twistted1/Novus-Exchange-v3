import React from 'react';
import { Page } from '../types';

interface HeroProps {
  onNavClick: (page: Page) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavClick }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[60vh] text-center relative z-10 px-6 max-w-4xl">
      <div className="mb-6 animate-fade-in-up w-full flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-[1.15] text-center">
          <span className="block">CUT THROUGH THE NOISE</span>
          <span className="block">
            STAY <span className="text-[#e62e2e]">INFORMED</span>
          </span>
        </h1>
      </div>
      
      <p className="text-sm sm:text-base md:text-lg text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up font-medium tracking-wide leading-relaxed text-center" style={{ animationDelay: '0.2s' }}>
        Critical, clear-eyed commentary on the complex issues shaping our global landscape. We challenge the narrative, so you don't have to.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up w-full" style={{ animationDelay: '0.4s' }}>
        <button
          onClick={() => onNavClick(Page.Articles)}
          className="w-full sm:w-auto border border-white/10 hover:border-white/30 text-white font-bold py-3.5 px-10 rounded-sm transition-all duration-300 uppercase tracking-widest text-sm bg-white/[0.03] hover:bg-white/[0.08]"
        >
          Explore Analysis
        </button>
        <a
          href="https://www.youtube.com/@NovusExchange"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#e62e2e] hover:bg-red-700 text-white font-bold py-3.5 px-10 rounded-sm transition-all duration-300 uppercase tracking-widest text-sm"
        >
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
             <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z"></path>
          </svg>
          Watch on YouTube
        </a>
      </div>
    </div>
  );
};

export default Hero;