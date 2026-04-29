import SocialLinks from './layout/SocialLinks';
import LogoIcon from './LogoIcon';

/**
 * FooterSection Component
 * 
 * Renders the global footer of the application. It contains branding, 
 * social links, navigation links, topic categories, legal links, and 
 * copyright information.
 */
export default function FooterSection() {
  return (
    <footer className="bg-black border-t border-white/10 pt-8 pb-4 relative overflow-hidden w-full">
      {/* Decorative background glow */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-900/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 mb-8">
          
          {/* Brand Column */}
          <div className="lg:col-span-3">
            <div className="flex items-center space-x-3 mb-4">
              <LogoIcon size="md" />
              <span className="text-white font-black text-lg uppercase tracking-tight italic">Novus Exchange</span>
            </div>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-sm">
              Investigative media for the curious and the courageous. We challenge narratives, expose power, and put truth first.
            </p>
            
            <div className="flex justify-start">
              <SocialLinks />
            </div>
          </div>

          {/* Platform Links */}
          <div className="lg:col-span-2 lg:col-start-6 text-left">
            <h4 className="text-white font-bold text-[10px] tracking-[0.3em] uppercase mb-4 opacity-90 border-b border-white/5 pb-2 inline-block">Platform</h4>
            <ul className="space-y-2">
              <li><a href="#mission" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">About Us</a></li>
              <li><a href="#solutions" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Solutions</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Articles</a></li>
              <li><a href="#trending" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Trending</a></li>
            </ul>
          </div>

          {/* Topics Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-white font-bold text-[10px] tracking-[0.3em] uppercase mb-4 opacity-90 border-b border-white/5 pb-2 inline-block">Topics</h4>
            <ul className="space-y-2">
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Geopolitics</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Economics</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Technology</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Climate</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Security</a></li>
              <li><a href="#articles" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Media</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-white font-bold text-[10px] tracking-[0.3em] uppercase mb-4 opacity-90 border-b border-white/5 pb-2 inline-block">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white text-xs font-medium transition-colors">Disclaimer</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-gray-500 text-xs">
              © {new Date().getFullYear()} Novus Exchange. All rights reserved. Built for truth.
            </p>
            <Link 
              to="/admin" 
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-600 hover:text-red-500 transition-colors flex items-center gap-2 group"
            >
              <div className="w-1 h-1 bg-gray-600 group-hover:bg-red-500 transition-colors rounded-full" />
              Command
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
            >
              Back to Top
              <svg className="w-4 h-4 transition-transform group-hover:-translate-y-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7 7 7" />
              </svg>
            </button>
            
            <div className="hidden md:flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" />
                Live
              </span>
              <span>Independent</span>
              <span>Unfiltered</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
