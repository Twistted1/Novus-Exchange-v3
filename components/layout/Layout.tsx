import React from 'react';
import Navbar from '../Navbar';
import FooterSection from '../FooterSection';
import { Page } from '../../types';

interface LayoutProps {
    /** The main content to be rendered within the layout */
    children: React.ReactNode;
    /** The currently active page/section (optional) */
    activePage?: Page;
    /** Callback function triggered when a navigation link is clicked */
    onNavClick: (page: Page) => void;
    /** The current search query string */
    searchQuery: string;
    /** Callback function to update the search query */
    onSearchChange: (query: string) => void;
}

/**
 * Layout Component
 * 
 * Provides the main structural wrapper for the application, including the 
 * top navigation bar (Navbar) and the bottom footer (FooterSection).
 * It passes search-related props down to the Navbar for global search functionality.
 */
const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavClick, searchQuery, onSearchChange }) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Navbar searchQuery={searchQuery} onSearchChange={onSearchChange} />
      <main className="flex-grow">
        {children}
      </main>
      <FooterSection />
    </div>
  );
};

export default Layout;