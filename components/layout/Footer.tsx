import React from 'react';
import { Page } from '../../types';

interface FooterProps {
  onNavClick: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { label: 'Overview', page: Page.Home },
    { label: 'Mission', page: Page.Mission },
    { label: 'Intelligence', page: Page.Articles },
    { label: 'Trending', page: Page.GlobalTrending },
  ];

  const ecosystemItems = [
    { label: 'Media Suite', page: Page.Ecosystem },
    { label: 'CMS Pro', page: Page.Ecosystem },
    { label: 'Beta Program', page: Page.Ecosystem },
  ];

  return (
    <footer className="bg-black border-t border-white/5 pt-12 pb-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-10 md:gap-16 lg:gap-24 mb-12 text-center md:text-left">
          {/* Brand & Tagline */}
          <div className="flex flex-col items-center md:items-start">
            <button onClick={() => onNavClick(Page.Home)} className="flex items-center space-x-3 mb-4 group">
              <img 
                src="/logo.png" 
                alt="Novus Exchange" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <svg className="h-5 w-5 text-white hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
              <span className="text-white font-black text-xl tracking-tight uppercase group-hover:text-gray-300 transition-colors">Novus Exchange</span>
            </button>
            <p className="text-sm text-gray-500 leading-relaxed max-w-[250px] font-medium tracking-tight">
              Engineering the future of global discourse through investigative clarity.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-semibold text-white tracking-tight mb-4">Research</h4>
            <ul className="space-y-3">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => onNavClick(item.page)} 
                    className="text-gray-400 hover:text-white text-sm font-medium tracking-tight transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Ecosystem Column */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-semibold text-white tracking-tight mb-4">Ecosystem</h4>
            <ul className="space-y-3">
              {ecosystemItems.map((item) => (
                <li key={item.label}>
                  <button 
                    onClick={() => onNavClick(item.page)} 
                    className="text-gray-400 hover:text-white text-sm font-medium tracking-tight transition-colors"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact/Legal Column */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-sm font-semibold text-white tracking-tight mb-4">Connectivity</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => onNavClick(Page.Contact)} 
                  className="text-[#e62e2e] hover:text-red-400 text-sm font-semibold tracking-tight transition-colors"
                >
                  Direct Inquiry
                </button>
              </li>
              <li>
                <button className="text-gray-400 hover:text-white text-sm font-medium tracking-tight transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-center md:justify-between gap-4 text-center">
          <p className="text-xs text-gray-600 font-medium tracking-tight">
            &copy; {new Date().getFullYear()} Novus Exchange. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6">
            <span className="text-xs text-gray-600 font-medium tracking-tight">Stay Vigilant</span>
            <span className="text-xs text-gray-600 font-medium tracking-tight">London / NYC</span>
            <button 
              onClick={scrollToTop} 
              className="text-xs text-gray-400 hover:text-white font-semibold tracking-tight transition-colors flex items-center gap-1.5 ml-0 md:ml-4"
            >
              Back to Top 
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;