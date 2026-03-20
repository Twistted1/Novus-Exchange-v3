import React from 'react';
import { Page } from '../types';

interface EcosystemCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    tag: string;
    tagStyles: string;
    buttonText: string;
}

const EcosystemCard: React.FC<EcosystemCardProps> = ({ title, description, icon, tag, tagStyles, buttonText }) => (
    <div className="flex flex-col p-10 h-full relative group border border-white/10 bg-[#0a0a0a] hover:bg-[#0f0f0f] rounded-2xl transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_20px_50px_rgba(6,182,212,0.3)] hover:-translate-y-2 hover:scale-[1.02]">
        {/* Status Badge */}
        <div className={`absolute top-6 right-8 px-3 py-1.5 rounded-md text-sm font-bold uppercase tracking-widest border ${tagStyles}`}>
            {tag}
        </div>
        
        {/* Icon */}
        <div className="mb-10 text-gray-300 w-12 h-12 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/10">
            {icon}
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-5 tracking-tight uppercase">
            {title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-300 text-base leading-relaxed mb-10 flex-grow font-normal">
            {description}
        </p>
        
        {/* Action Button */}
        <button className="w-full border border-white/10 hover:border-[#e62e2e]/50 text-white font-bold py-3.5 rounded-md text-sm uppercase tracking-widest transition-all duration-300 bg-white/5 hover:bg-[#e62e2e]/10">
            {buttonText}
        </button>
    </div>
);

interface EcosystemProps {
    onNavClick?: (page: Page) => void;
}

const Ecosystem: React.FC<EcosystemProps> = ({ onNavClick }) => {
    return (
        <div className="w-full max-w-6xl mx-auto px-4 flex flex-col items-center">
            <div className="text-center mb-16 w-full max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-black text-white mb-3 uppercase tracking-tight flex items-center justify-center gap-3">
                  THE NOVUS <span className="text-[#e62e2e]">ECOSYSTEM</span>
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed uppercase tracking-[0.2em] font-bold">
                    We build the engines that power the next generation of global media.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
                <EcosystemCard 
                    title="AI Media Suite"
                    tag="COMING SOON"
                    tagStyles="bg-purple-900/20 text-purple-400 border-purple-500/30"
                    description="The all-in-one creative powerhouse. Generate high-fidelity images, edit video, and leverage our advanced AI chat for content ideation."
                    buttonText="JOIN WAITLIST"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                />
                <EcosystemCard 
                    title="Media Hub"
                    tag="PRIVATE BETA"
                    tagStyles="bg-cyan-900/20 text-cyan-400 border-cyan-500/30"
                    description="End-to-end content automation. Script generation, voice cloning in 30+ languages, and automated social scheduling."
                    buttonText="REQUEST BETA"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>}
                />
                <EcosystemCard 
                    title="Novus CMS Pro"
                    tag="TESTING"
                    tagStyles="bg-yellow-900/20 text-yellow-400 border-yellow-500/30"
                    description="A professional-grade headless CMS designed for speed and flexibility. Perfect for high-traffic news and media sites."
                    buttonText="VIEW FEATURES"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>}
                />
                <EcosystemCard 
                    title="Enterprise Hub"
                    tag="IN DEVELOPMENT"
                    tagStyles="bg-gray-800/40 text-gray-400 border-white/10"
                    description="The ultimate publishing engine. Advanced roles, multi-site management, and dedicated support for large-scale organizations."
                    buttonText="CONTACT SALES"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                />
            </div>
        </div>
    );
};

export default Ecosystem;