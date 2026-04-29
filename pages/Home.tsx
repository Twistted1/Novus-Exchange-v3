import React, { useEffect, useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Page } from '../types';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import ArticlesSection from '../components/ArticlesSection';
import TrendingSection from '../components/TrendingSection';
import SolutionsSection from '../components/SolutionsSection';

interface HomeProps {
  /** Callback function triggered when a navigation link is clicked */
  onNavClick: (page: Page) => void;
  /** The currently active page/section */
  activePage: Page;
  /** Callback function to update the active page state */
  setActivePage: (page: Page) => void;
  /** The current search query */
  searchQuery: string;
}

/**
 * Home Component
 * 
 * Serves as the main landing page for the application. It acts as a container
 * for various sections (Hero, Mission, Ecosystem, Articles, Trending, Contact)
 * and uses an IntersectionObserver to automatically update the active navigation
 * state as the user scrolls through the page.
 */
const Home: React.FC<HomeProps> = ({ onNavClick, activePage, setActivePage, searchQuery }) => {
  // Individual refs for each section to avoid recreating objects on every render
  const homeRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLDivElement>(null);
  const ecosystemRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  const articlesRef = useRef<HTMLDivElement>(null);

  // Memoize the refs array so the IntersectionObserver effect doesn't re-run unnecessarily
  const sectionRefs = useMemo(() => [
    homeRef, missionRef, ecosystemRef, trendingRef, articlesRef
  ], []);

  useEffect(() => {
    const observerOptions = {
        root: null,
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                const pageMap: Record<string, Page> = {
                    'home': Page.Home,
                    'mission': Page.Mission,
                    'trending': Page.GlobalTrending,
                    'articles': Page.Articles,
                    'ecosystem': Page.Ecosystem
                };
                if (pageMap[id] && activePage !== Page.Article && activePage !== Page.Author) {
                    setActivePage(pageMap[id]);
                }
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    sectionRefs.forEach(ref => {
        if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [activePage, setActivePage, sectionRefs]);

  return (
    <div className="flex flex-col w-full items-center">
        <Helmet>
          <title>Novus Exchange | Investigative Media & Intelligence</title>
          <meta name="description" content="Novus Exchange is an investigative media platform and intelligence workspace. We build software from the newsroom." />
        </Helmet>
        
        <section ref={homeRef} id="home" className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden shrink-0 scroll-mt-20">
            <HeroSection onNavClick={onNavClick} />
        </section>

        <section ref={missionRef} id="mission" className="w-full min-h-screen flex flex-col items-center justify-start px-4 shrink-0 scroll-mt-20">
            <AboutSection />
        </section>

        <section ref={ecosystemRef} id="ecosystem" className="w-full min-h-screen flex flex-col items-center justify-start px-4 shrink-0 scroll-mt-20">
            <SolutionsSection />
        </section>

        <section ref={trendingRef} id="trending" className="w-full min-h-screen flex flex-col items-center justify-start px-4 shrink-0 scroll-mt-20">
            <TrendingSection />
        </section>

        <section ref={articlesRef} id="articles" className="w-full min-h-screen flex flex-col items-center justify-start px-4 shrink-0 scroll-mt-20">
            <ArticlesSection searchQuery={searchQuery} />
        </section>
    </div>
  );
};

export default Home;
