import React from 'react';
import GlassCard from './GlassCard';

const About: React.FC = () => {
  const videoId = 'cB2BENj1jaw';
  
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
          
          {/* Right Video Column (65%) */}
          <div className="bg-black relative aspect-video md:aspect-auto overflow-hidden">
            <iframe
              className="absolute inset-0 w-full h-full pointer-events-none"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1&playsinline=1`}
              title="Novus Exchange Mission"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            
            {/* Context Overlay */}
            <div className="absolute top-6 right-6 z-10">
              <div className="bg-black/70 backdrop-blur-md border border-white/10 px-4 py-2 rounded-md flex items-center gap-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Live Feed</span>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default About;