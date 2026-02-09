import React, { useState } from 'react';

const Phylogeny: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
                
                {/* Standardized Header */}
                <header className="mb-8 border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-accent">
                            <span className="material-symbols-outlined text-lg">hub</span>
                            <span className="text-[10px] font-bold tracking-wider uppercase">Evolutionary Analysis</span>
                        </div>
                        <h1 className="text-2xl font-light text-primary">Phylogenetic Tree</h1>
                        <p className="text-slate-500 text-xs mt-2 max-w-2xl">
                            Interactive visualization of plastic-degrading enzyme relationships powered by iTOL.
                        </p>
                    </div>
                    <div className="flex gap-2">
                         <a 
                            href="https://itol.embl.de/shared/mtfbwy" 
                            target="_blank" 
                            rel="noreferrer"
                            className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex items-center gap-2"
                         >
                            <span className="material-symbols-outlined text-base">open_in_new</span>
                            Open Fullscreen
                         </a>
                    </div>
                </header>

                {/* Inner Panel - Iframe Container */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative h-[600px]">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                            <div className="flex flex-col items-center gap-3">
                                <span className="material-symbols-outlined text-4xl text-accent animate-spin">progress_activity</span>
                                <p className="text-slate-500 text-sm font-medium animate-pulse">Loading visualization...</p>
                            </div>
                        </div>
                    )}
                    <iframe 
                        src="https://itol.embl.de/shared/mtfbwy" 
                        className={`w-full h-full border-0 bg-slate-50 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                        title="iTOL Phylogenetic Tree"
                        loading="lazy"
                        allowFullScreen
                        onLoad={() => setIsLoading(false)}
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Phylogeny;