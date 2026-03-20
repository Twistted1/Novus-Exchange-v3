import React from 'react';
import Header from '../Header';
import Footer from './Footer';
import { Page } from '../../types';

interface LayoutProps {
    children: React.ReactNode;
    activePage?: Page;
    onNavClick: (page: Page) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavClick, searchQuery, onSearchChange }) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      <Header 
        activePage={activePage} 
        onNavClick={onNavClick} 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <main className="flex-grow">
        {children}
      </main>
      <Footer onNavClick={onNavClick} />
    </div>
  );
};

export default Layout;