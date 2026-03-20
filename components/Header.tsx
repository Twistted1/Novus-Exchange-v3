import React, { useState, useEffect } from 'react';
import { Page } from '../types';

interface NavLinkProps {
  page: Page;
  activePage?: Page;
  onNavClick: (page: Page) => void;
  children: React.ReactNode;
}

const NavLink: React.FC<NavLinkProps> = ({ page, activePage, onNavClick, children }) => {
  const isActive = activePage === page || (page === Page.Home && activePage === undefined);
  const href = page === Page.Home ? '#' : `#${page}`;
  
  return (
    <a 
      href={href} 
      onClick={(e) => { e.preventDefault(); onNavClick(page); }} 
      className={`px-4 py-2 rounded-md text-sm font-semibold tracking-tight transition-all duration-200 ${
        isActive ? 'bg-[#1a1a1a] text-white' : 'text-gray-300 hover:text-white'
      }`}
    >
      {children}
    </a>
  );
};

interface HeaderProps {
    activePage?: Page;
    onNavClick: (page: Page) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activePage, onNavClick, searchQuery, onSearchChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const navItems = [
    { label: 'Home', page: Page.Home },
    { label: 'About', page: Page.Mission },
    { label: 'Articles', page: Page.Articles },
    { label: 'Trending', page: Page.GlobalTrending },
    { label: 'Solutions', page: Page.Ecosystem }, 
    { label: 'Contact', page: Page.Contact },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-md py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Logo Left */}
        <button onClick={() => onNavClick(Page.Home)} className="flex items-center space-x-3 group">
          <img 
            src="/logo.png" 
            alt="Novus Exchange" 
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <svg className="h-6 w-6 text-white hidden" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
          <span className="text-white font-black text-xl tracking-tight uppercase group-hover:text-gray-300 transition-colors">Novus Exchange</span>
        </button>
        
        {/* Nav & Search Right */}
        <div className="flex items-center space-x-2">
          <nav className="hidden lg:flex items-center space-x-1 mr-6">
            {navItems.map(item => (
                <NavLink key={item.page} page={item.page} activePage={activePage} onNavClick={onNavClick}>
                  {item.label}
                </NavLink>
            ))}
          </nav>

          <div className="relative group">
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 rounded-md py-2.5 pl-10 pr-4 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-48 md:w-64 placeholder:text-gray-500"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;