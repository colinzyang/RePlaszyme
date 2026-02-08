import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsCards from './components/StatsCards';
import Timeline from './components/Timeline';
import Footer from './components/Footer';
import Browse from './components/Browse';
import Blast from './components/Blast';
import Phylogeny from './components/Phylogeny';
import EnzymeDetail from './components/EnzymeDetail';
import About from './components/About';
import { Enzyme } from './types';

type View = 'home' | 'browse' | 'blast' | 'phylogeny' | 'about' | 'detail';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedEnzyme, setSelectedEnzyme] = useState<Enzyme | null>(null);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (view !== 'detail') {
        setSelectedEnzyme(null);
    }
  };

  const handleSelectEnzyme = (enzyme: Enzyme) => {
      setSelectedEnzyme(enzyme);
      setCurrentView('detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
      switch (currentView) {
          case 'home':
              return (
                  <div className="flex flex-col gap-16 animate-fade-in-up">
                      <Hero />
                      <StatsCards />
                      <Timeline />
                  </div>
              );
          case 'browse':
              return <Browse onSelectEnzyme={handleSelectEnzyme} />;
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
        <div className="max-w-[1200px] mx-auto">
          {renderContent()}
        </div>
      </main>
      
      <Footer onNavigate={handleNavigate} />
    </>
  );
};

export default App;