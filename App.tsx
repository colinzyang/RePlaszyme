import React, { useState, useEffect } from 'react';
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
import { getDatabaseStats, DatabaseStats } from './services/api/databaseService';

type View = 'home' | 'browse' | 'blast' | 'phylogeny' | 'predictor' | 'about' | 'detail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');

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

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    // Scroll to top immediately when navigating
    window.scrollTo(0, 0);
    if (view !== 'detail') {
        setSelectedEnzyme(null);
    }
  };

  const handleSelectEnzyme = (enzyme: Enzyme) => {
      setSelectedEnzyme(enzyme);
      setCurrentView('detail');
      window.scrollTo(0, 0);
  };

  const handleSearchFromHome = (term: string) => {
      setInitialSearchTerm(term);
      setCurrentView('browse');
      window.scrollTo(0, 0);
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
              return <Blast />;
          case 'phylogeny':
              return <Phylogeny />;
          case 'detail':
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