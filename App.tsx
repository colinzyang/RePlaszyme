import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsCards from './components/StatsCards';
import Timeline from './components/Timeline';
import Footer from './components/Footer';
import Browse from './components/Browse';
import Blast from './components/Blast';
import Phylogeny from './components/Phylogeny';
import EnzymeDetail from './components/EnzymeDetail';
import Predictor from './components/Predictor';
import About from './components/About';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { Enzyme } from './types';
import { getDatabaseStats, getEnzymeById, DatabaseStats } from './services/api/databaseService';

type View = 'home' | 'browse' | 'blast' | 'phylogeny' | 'predictor' | 'about' | 'detail';

// Route mapping: hash path -> view
const ROUTE_TO_VIEW: Record<string, View> = {
  '/': 'home',
  '/browse': 'browse',
  '/blast': 'blast',
  '/phylogeny': 'phylogeny',
  '/predictor': 'predictor',
  '/about': 'about',
  '/detail': 'detail',
};

// View to hash path mapping
const VIEW_TO_ROUTE: Record<View, string> = {
  home: '/',
  browse: '/browse',
  blast: '/blast',
  phylogeny: '/phylogeny',
  predictor: '/predictor',
  about: '/about',
  detail: '/detail',
};

// Parse hash URL to extract view and parameters
interface ParsedRoute {
  view: View;
  params: {
    plaszymeId?: string;
    search?: string;
  };
}

function parseHash(hash: string): ParsedRoute {
  // Remove leading # and split by ?
  const cleanHash = hash.replace(/^#/, '') || '/';
  const [path, queryString] = cleanHash.split('?');

  // Extract view from path
  const pathParts = path.split('/').filter(Boolean);
  const routePath = '/' + (pathParts[0] || '');
  const view = ROUTE_TO_VIEW[routePath] || 'home';

  // Extract parameters
  const params: ParsedRoute['params'] = {};

  // For detail view, get plaszymeId from path
  if (view === 'detail' && pathParts[1]) {
    params.plaszymeId = pathParts[1];
  }

  // Parse query string
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    params.search = searchParams.get('search') || undefined;
  }

  return { view, params };
}

// Build hash URL from view and parameters
function buildHash(view: View, params: ParsedRoute['params'] = {}): string {
  let path = VIEW_TO_ROUTE[view];

  if (view === 'detail' && params.plaszymeId) {
    path += '/' + params.plaszymeId;
  }

  const queryParams = new URLSearchParams();
  if (params.search) {
    queryParams.set('search', params.search);
  }

  const queryString = queryParams.toString();
  return '#' + path + (queryString ? '?' + queryString : '');
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(() => {
    // Initialize from URL hash
    const { view } = parseHash(window.location.hash);
    return view;
  });
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [initialSearchTerm, setInitialSearchTerm] = useState<string | undefined>(undefined);
  const [isEnzymeLoading, setIsEnzymeLoading] = useState(false);

  // Handle URL hash changes (browser back/forward)
  const handleHashChange = useCallback(async () => {
    const { view, params } = parseHash(window.location.hash);

    setCurrentView(view);

    // Handle detail view - load enzyme if needed
    if (view === 'detail' && params.plaszymeId) {
      // Only fetch if we don't have the enzyme or it's a different one
      if (!selectedEnzyme || selectedEnzyme.plaszymeId !== params.plaszymeId) {
        setIsEnzymeLoading(true);
        try {
          const enzyme = await getEnzymeById(params.plaszymeId);
          if (enzyme) {
            setSelectedEnzyme(enzyme);
          } else {
            // Enzyme not found, redirect to browse
            console.warn(`Enzyme ${params.plaszymeId} not found, redirecting to browse`);
            window.location.hash = '/browse';
          }
        } catch (error) {
          console.error('Failed to load enzyme:', error);
          // Redirect to browse on error
          window.location.hash = '/browse';
        } finally {
          setIsEnzymeLoading(false);
        }
      }
    } else {
      // Clear selected enzyme when navigating away from detail
      if (view !== 'detail') {
        setSelectedEnzyme(null);
      }
    }

    // Handle search parameter for browse view
    if (view === 'browse' && params.search !== undefined) {
      setInitialSearchTerm(params.search);
    }
  }, [selectedEnzyme]);

  // Load database statistics on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsStatsLoading(true);
        setStatsError(null);
        const stats = await getDatabaseStats();
        setDbStats(stats);
      } catch (error) {
        console.error('Failed to load database statistics:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load database statistics. Please ensure the backend API is running.';
        setStatsError(errorMessage);
      } finally {
        setIsStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Listen for hash changes (browser navigation)
  useEffect(() => {
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [handleHashChange]);

  // Handle initial route on mount
  useEffect(() => {
    const initRoute = async () => {
      const { view, params } = parseHash(window.location.hash);

      // If we have a detail route with plaszymeId, load the enzyme
      if (view === 'detail' && params.plaszymeId) {
        setIsEnzymeLoading(true);
        try {
          const enzyme = await getEnzymeById(params.plaszymeId);
          if (enzyme) {
            setSelectedEnzyme(enzyme);
          } else {
            // Enzyme not found, redirect to browse
            console.warn(`Enzyme ${params.plaszymeId} not found, redirecting to browse`);
            window.location.hash = '/browse';
          }
        } catch (error) {
          console.error('Failed to load enzyme on init:', error);
        } finally {
          setIsEnzymeLoading(false);
        }
      }

      // Set initial search term if present
      if (view === 'browse' && params.search) {
        setInitialSearchTerm(params.search);
      }
    };

    // Only run if we have a non-home hash
    if (window.location.hash && window.location.hash !== '#/' && window.location.hash !== '#') {
      initRoute();
    }
  }, []);

  const handleNavigate = (view: string, params?: { plaszymeId?: string; search?: string }) => {
    const newView = view as View;

    // Update URL hash
    const newHash = buildHash(newView, params);
    window.location.hash = newHash;

    // Scroll to top immediately when navigating
    window.scrollTo(0, 0);
  };

  const handleSelectEnzyme = (enzyme: Enzyme) => {
    setSelectedEnzyme(enzyme);
    // Navigate to detail with plaszymeId in URL
    handleNavigate('detail', { plaszymeId: enzyme.plaszymeId });
  };

  const handleSearchFromHome = (term: string) => {
    setInitialSearchTerm(term);
    handleNavigate('browse', { search: term });
  };

  const renderContent = () => {
      switch (currentView) {
          case 'home':
              return (
                  <div className="flex flex-col gap-16 animate-fade-in-up">
                      <Hero onSearch={handleSearchFromHome} onNavigate={handleNavigate} />
                      {statsError && <ErrorMessage message={statsError} />}
                      <StatsCards stats={dbStats} isLoading={isStatsLoading} />
                      <Timeline />
                  </div>
              );
          case 'browse':
              return <Browse onSelectEnzyme={handleSelectEnzyme} initialSearchTerm={initialSearchTerm} />;
          case 'predictor':
              return <Predictor />;
          case 'blast':
              return <Blast onSelectEnzyme={handleSelectEnzyme} />;
          case 'phylogeny':
              return <Phylogeny />;
          case 'detail':
              if (isEnzymeLoading) {
                  return (
                      <div className="flex items-center justify-center min-h-[400px]">
                          <LoadingSpinner />
                      </div>
                  );
              }
              if (selectedEnzyme) {
                  return <EnzymeDetail enzyme={selectedEnzyme} onBack={() => handleNavigate('browse')} />;
              }
              return <Browse onSelectEnzyme={handleSelectEnzyme} />; // Fallback
          case 'about':
              return <About />;
          default:
              return null;
      }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-0 bg-mesh-gradient-light animated-mesh opacity-100 pointer-events-none"
        data-alt="Abstract soft white and teal mesh gradient background"
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-blue-50/40 pointer-events-none" />
      {/* Subtle dot pattern overlay for depth */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(14, 165, 233, 0.45) 1px, transparent 0)`, // Light teal dots background
          backgroundSize: '28px 28px'
        }}
      />
      
      <Navbar currentPage={currentView} onNavigate={handleNavigate} />
      
      <main className="relative z-10 flex-grow pt-32 pb-20 px-4 md:px-8 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <Footer onNavigate={handleNavigate} />
    </>
  );
};

export default App;