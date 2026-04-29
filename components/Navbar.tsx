import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoIcon from "./LogoIcon";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#mission" },
  { label: "Solutions", href: "#ecosystem" },
  { label: "Trending", href: "#trending" },
  { label: "Articles", href: "#articles" },
];

interface NavbarProps {
  /** The current search query string */
  searchQuery: string;
  /** Callback function to update the search query */
  onSearchChange: (query: string) => void;
}

/**
 * Navbar Component
 * 
 * Renders the top navigation bar. It handles smooth scrolling to sections 
 * on the home page, manages active link states based on scroll position, 
 * provides a mobile menu toggle, and includes a global search input.
 */
export default function Navbar({ searchQuery, onSearchChange }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#home");
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    
    // Determine active link based on hash or path
    const determineActiveLink = () => {
        if (location.pathname !== '/') {
            setActiveLink('');
        } else {
            setActiveLink(window.location.hash || "#home");
        }
    };
    
    window.addEventListener("scroll", onScroll);
    window.addEventListener("hashchange", determineActiveLink);
    determineActiveLink();
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", determineActiveLink);
    };
  }, [location.pathname]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(href.substring(1));
            if (element) {
                const headerOffset = 80;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                window.history.pushState(null, '', `/${href}`);
                setActiveLink(href);
            }
        }, 100);
    } else {
        const element = document.getElementById(href.substring(1));
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            window.history.pushState(null, '', `/${href}`);
            setActiveLink(href);
        }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 backdrop-blur-md py-3 border-b border-white/5' : 'bg-transparent py-6'}`}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" onClick={(e) => handleNavClick(e as any, "#home")} className="flex items-center space-x-3 group z-50">
          <LogoIcon size="md" className="group-hover:scale-110 transition-transform" />
          <span className="text-white font-black text-xl tracking-tight uppercase group-hover:text-red-500 transition-colors">Novus Exchange</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`/${link.href}`}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`px-4 py-2 text-sm font-medium tracking-wide rounded transition-all duration-200 ${
                activeLink === link.href
                  ? "bg-white text-black"
                  : "text-gray-300 hover:text-white hover:bg-white/10"
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Search & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          <div className="relative hidden md:block">
            <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 rounded-md py-2 pl-10 pr-4 text-sm font-medium text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all w-48 lg:w-64 placeholder:text-gray-500"
            />
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button 
            className="lg:hidden text-white p-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-black border-b border-white/10 px-6 py-4 flex flex-col shadow-2xl">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={`/${link.href}`}
              className="block py-3 text-gray-300 hover:text-white border-b border-white/5 text-sm font-medium tracking-wide"
              onClick={(e) => handleNavClick(e, link.href)}
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
