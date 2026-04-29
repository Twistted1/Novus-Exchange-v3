import React, { useState, useEffect } from 'react';

/**
 * BackToTop Component
 * 
 * A floating button that appears when the user scrolls down, 
 * allowing them to smoothly scroll back to the top of the page.
 */
const BackToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className={`fixed bottom-8 right-8 z-40 transition-all duration-300 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50 pointer-events-none'}`}>
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-red-700 hover:scale-110 active:scale-95 transition-all group"
        aria-label="Back to Top"
      >
        <svg 
          className="w-6 h-6 transition-transform group-hover:-translate-y-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
};

export default BackToTop;
