import React, { useState } from 'react';
import { analyzeProteinSequence } from '@/services/predictionService';

const Hero: React.FC = () => {
    const [inputValue, setInputValue] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);

    const handleSearch = async () => {
        if (!inputValue.trim()) return;
        
        setIsAnalyzing(true);
        setAnalysisResult(null);
        
        // In a real app this would search the DB, here we use Gemini to "Analyze" the query intent or sequence
        const result = await analyzeProteinSequence(inputValue);
        
        setAnalysisResult(result);
        setIsAnalyzing(false);
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
                            disabled={isAnalyzing}
                            className="w-full md:w-auto h-12 md:h-14 px-8 rounded-full bg-accent hover:bg-accent-glow text-white font-medium text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-accent/40 disabled:opacity-70 disabled:cursor-not-allowed my-1 md:my-0 md:mr-1"
                        >
                            {isAnalyzing ? (
                                <span className="animate-spin material-symbols-outlined text-sm">progress_activity</span>
                            ) : (
                                <span>Search</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* AI Result */}
                {analysisResult && (
                    <div className="w-full max-w-4xl mt-4 animate-fade-in-up px-2">
                        <div className="glass-panel rounded-2xl p-6 border-t-4 border-accent shadow-xl">
                            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg text-accent">smart_toy</span>
                                AI Analysis Result
                            </h3>
                            <div className="text-xs text-slate-700 leading-relaxed font-mono">
                                    <div dangerouslySetInnerHTML={{ __html: analysisResult.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-primary">$1</span>') }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Hero;