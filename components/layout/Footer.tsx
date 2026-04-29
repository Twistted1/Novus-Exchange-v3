import React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../types';
import SocialLinks from './SocialLinks';
import LogoIcon from '../LogoIcon';

interface FooterProps {
  onNavClick: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/5 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Branding */}
          <div className="flex items-center gap-4">
            <button onClick={() => onNavClick(Page.Home)} className="flex items-center space-x-2 group">
              <LogoIcon size="sm" className="group-hover:scale-105 transition-transform" />
            </button>
            <span className="hidden md:block w-px h-3 bg-white/10"></span>
            <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em]">
              Critical Commentary
            </p>
          </div>

          {/* Center: Quick Links Inline */}
          <nav className="flex items-center gap-6">
            {['About', 'Articles', 'Trending', 'Solutions'].map((label) => (
              <button 
                key={label}
                onClick={() => onNavClick(label.toLowerCase() === 'solutions' ? Page.Ecosystem : label.toLowerCase() as Page)} 
                className="text-gray-500 hover:text-white text-[9px] font-black uppercase tracking-[0.2em] transition-colors"
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right: Copyright & Top */}
          <div className="flex items-center gap-6">
            <div className="flex gap-4 scale-75 origin-right">
              <SocialLinks />
            </div>
            <button 
              onClick={scrollToTop}
              className="text-[9px] font-black text-white/20 hover:text-white uppercase tracking-widest transition-all"
            >
              TOP ↑
            </button>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-white/[0.03] text-center flex flex-col md:flex-row items-center justify-center gap-4">
          <p className="text-[8px] uppercase tracking-[0.4em] text-gray-700 font-bold">
            &copy; {new Date().getFullYear()} NOVUS EXCHANGE INTEL.
          </p>
          <Link to="/admin" className="text-[8px] font-black text-gray-600 hover:text-red-500 transition-colors uppercase tracking-[0.4em]">
            Command
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;