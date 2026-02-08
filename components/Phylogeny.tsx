import React from 'react';

const Phylogeny: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-8 md:p-12 md:px-16 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-emerald-400/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <header className="border-b border-slate-200 pb-8 mb-10 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-4 text-emerald-600">
                                <span className="material-symbols-outlined">hub</span>
                                <span className="text-xs font-bold tracking-wider uppercase">Evolutionary Analysis</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-light text-primary mb-6">Phylogenetic Tree</h1>
                            <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl">
                                Explore evolutionary relationships and divergence of plastic-degrading enzymes. 
                                Visualize clustering patterns and infer ancestral functions through interactive tree visualization.
                            </p>
                        </div>
                        <div className="flex gap-3 mb-1">
                             <button className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">restart_alt</span>
                                Reset View
                             </button>
                             <button className="px-4 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">download</span>
                                Export Newick
                             </button>
                        </div>
                    </div>
                </header>

                <div className="relative z-10">
                    <div className="bg-slate-50/50 rounded-2xl p-2 h-[600px] border border-slate-200 relative overflow-hidden flex flex-col items-center justify-center">
                         {/* Background watermark */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                            <span className="material-symbols-outlined text-[15rem]">account_tree</span>
                         </div>
                         
                         {/* Simulated IFrame container for iTOL/Tree Viewer */}
                         <div className="w-full h-full bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shadow-inner group transition-all hover:border-accent/30">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <span className="material-symbols-outlined text-5xl text-slate-300 group-hover:text-accent transition-colors">forest</span>
                            </div>
                            <h3 className="text-lg font-medium text-slate-600 mb-2">Interactive Tree Visualization</h3>
                            <p className="max-w-md text-center text-sm mb-8 px-4">
                                The visualization component loads external phylogenetic data (Newick/Nexus format).
                                Currently configured for dataset: <span className="font-mono text-slate-500 bg-slate-100 px-1 rounded">plastic_degraders_v2.4</span>
                            </p>
                            <button className="px-8 py-3 bg-primary text-white text-sm font-medium rounded-full shadow-lg shadow-primary/20 hover:bg-accent hover:shadow-accent/30 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined">play_circle</span>
                                Load Visualization
                            </button>
                         </div>
                    </div>
                    
                    {/* Legend / Info footer */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/60 border border-slate-100 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-xs text-slate-600">Proteobacteria</span>
                        </div>
                        <div className="bg-white/60 border border-slate-100 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-slate-600">Actinobacteria</span>
                        </div>
                        <div className="bg-white/60 border border-slate-100 p-4 rounded-xl flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-xs text-slate-600">Ascomycota</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Phylogeny;