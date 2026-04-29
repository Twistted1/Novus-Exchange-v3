import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { getLatestPodcastEpisode } from '../api/cms';
import { PodcastEpisode } from '../types';

const About: React.FC = () => {
  const [latestPodcast, setLatestPodcast] = useState<PodcastEpisode | null>(null);

  useEffect(() => {
    const fetchPodcast = async () => {
      const ep = await getLatestPodcastEpisode();
      setLatestPodcast(ep);
    };
    fetchPodcast();
  }, []);
  
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Title Section */}
      <div className="text-center mb-10 animate-fade-in-up">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight flex items-center justify-center gap-3">
          OUR <span className="text-[#e62e2e]">MISSION</span>
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-[0.2em] font-bold">
          Challenging conventional narratives to provide the full story.
        </p>
      </div>
      
      {/* 30/70 Split Card */}
      <GlassCard className="w-full overflow-hidden !p-0 border-white/[0.08] bg-[#0e0e11] shadow-2xl rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-[35%_65%] gap-0 min-h-[500px]">
          {/* Left Text Column (35%) */}
          <div className="p-8 sm:p-10 flex flex-col justify-center bg-[#0d0d0d] border-b md:border-b-0 md:border-r border-white/5 items-start">
            <div className="w-8 h-1 bg-[#e62e2e] mb-6"></div>
            <h3 className="text-base font-bold text-white mb-4 tracking-[0.15em] uppercase">
              The Standard
            </h3>
            <div className="space-y-4">
              <p className="text-gray-400 font-normal text-sm leading-relaxed">
                We shine a light on injustices and power dynamics impacting society. Our goal is to foster deep discussion through investigative excellence and uncompromising reporting.
              </p>
              <p className="text-gray-600 italic text-sm leading-relaxed uppercase tracking-wider">
                "Building engines that power the next generation of media."
              </p>
            </div>
          </div>
          
          {/* Right Podcast Column (65%) */}
          <div className="bg-black relative aspect-video md:aspect-auto overflow-hidden group cursor-pointer">
            <img 
              src={latestPodcast?.thumbnailUrl || "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?q=80&w=2070&auto=format&fit=crop"} 
              alt="Podcast Episode" 
              className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            {/* Context Overlay */}
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 rounded-md flex items-center gap-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Signal Active</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              </div>
            </div>

            {/* Info Overlay */}
            <div className="absolute bottom-6 left-8 right-8">
              <div className="flex px-2 py-0.5 bg-red-600/20 border border-red-500/30 w-fit rounded-sm mb-2">
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest leading-none py-1">Podcast // Season {latestPodcast?.season || "4"}</span>
              </div>
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-1">The Standard: Unfiltered</h4>
              <p className="text-gray-400 text-xs font-mono uppercase tracking-widest">Listen to the latest episode: {latestPodcast?.episodeNumber?.toString().padStart(3, '0') || "042"} // {latestPodcast?.title || "Decoding Power"}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default About;