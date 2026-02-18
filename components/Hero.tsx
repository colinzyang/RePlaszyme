import React, { useState } from 'react';

interface HeroProps {
    onSearch: (term: string) => void;
    onNavigate: (view: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onSearch, onNavigate }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSearch = () => {
        if (!inputValue.trim()) return;
        onSearch(inputValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <section className="relative pt-0 pb-8 md:pt-4 md:pb-16 w-full overflow-hidden flex flex-col gap-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end relative z-10">
                
                {/* Left Column: Title */}
                <div className="lg:col-span-8 flex flex-col gap-6 text-left pl-4">
                    
                    {/* Typography - Adjusted for 'PlaszymeDB' style (Clean, Gradient, Tech) */}
                    <h1 className="flex flex-col font-display leading-[0.85] tracking-tighter select-none">
                        <span className="text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-slate-900">
                            PLASTIC
                        </span>
                        {/* Outline text - Lighter stroke to match the clean aesthetic */}
                        <span className="text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-transparent [-webkit-text-stroke:1px_#cbd5e1] hover:[-webkit-text-stroke:1px_#0ea5e9] transition-all duration-500">
                            DEGRADING
                        </span>
                        {/* Gradient Text for 'ENZYMES' */}
                        <span className="text-5xl md:text-6xl lg:text-[5.5rem] xl:text-[6.5rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-accent-glow">
                            ENZYMES
                        </span>
                    </h1>
                </div>

                {/* Right Column: Text Layout - Bottom Aligned */}
                <div className="lg:col-span-4 flex flex-col justify-end h-full pb-10 lg:pb-16">
                     <div className="relative">
                        {/* Decorative background blur behind text */}
                        <div className="absolute -left-20 -top-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
                        
                        <p className="relative text-sm text-slate-500 font-light leading-relaxed text-left max-w-md">
                            A curated resource for enzymatic plastic degradation.
                            Explore sequences, structures, and phylogenetic relationships in a high-quality integrated environment.
                        </p>
                        <button
                            onClick={() => onNavigate('about')}
                            className="relative mt-4 text-xs font-medium text-accent hover:text-accent-glow transition-colors flex items-center gap-1 group"
                        >
                            <span>Explore more</span>
                            <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                        </button>
                     </div>
                </div>

            </div>

            {/* Centered Search Bar Section */}
            <div className="w-full flex flex-col items-center relative z-20 mt-4">
                <div className="w-full max-w-4xl relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 via-blue-200/20 to-accent/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative search-glass rounded-full p-2 pl-3 flex flex-col md:flex-row items-center gap-2 transition-all shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-accent/10 border border-white/80">
                        <div className="flex-1 flex items-center w-full px-4 h-14">
                            <span className="material-symbols-outlined text-slate-400 mr-3 text-2xl">search</span>
                            <input 
                                className="w-full bg-transparent border-none outline-none text-primary placeholder-slate-400 font-mono text-xs md:text-sm h-full" 
                                placeholder="Search by Enzyme Name, EC Number, Plastic Type or Protein Sequence." 
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="w-full md:w-auto h-12 md:h-14 px-8 rounded-full bg-accent hover:bg-accent-glow text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 my-1 md:my-0 md:mr-1"
                        >
                            <span>Search</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;