import React from 'react';

const About: React.FC = () => {
    return (
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
                
                {/* Standardized Header */}
                <header className="mb-8 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-2 mb-1 text-accent">
                        <span className="material-symbols-outlined text-lg">description</span>
                        <span className="text-[10px] font-bold tracking-wider uppercase">Documentation</span>
                    </div>
                    <h1 className="text-2xl font-light text-primary">About PlaszymeDB</h1>
                    <p className="text-slate-500 text-xs mt-2 max-w-2xl">
                        A curated functional database of plastic-degrading enzymes for environmental biotechnology.
                    </p>
                </header>

                <div className="relative z-10 flex flex-col gap-6">
                    
                    {/* Database Overview - Inner Panel */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h2 className="text-base font-medium text-primary mb-4 flex items-center gap-2">
                            Database Overview
                        </h2>
                        <div className="text-slate-600 text-sm leading-relaxed space-y-4 text-justify">
                            <p>
                                The database currently contains <strong className="text-primary font-semibold">474</strong> plastic-degrading enzymes from diverse microorganisms that have been reported in the scientific literature for their plastic biodegradation capabilities. These enzymes target <strong className="text-primary font-semibold">34</strong> different types of plastic polymers, with detailed characterization data including 3D structures, phylogenetic relationships, and kinetic parameters where available.
                            </p>
                            <p>
                                PlaszymeDB is updated regularly to incorporate new discoveries and research findings in the rapidly evolving field of plastic biodegradation. The database serves as a central resource for researchers working on plastic pollution solutions, enzyme engineering, and environmental biotechnology applications.
                            </p>
                        </div>
                    </section>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                            <h2 className="text-base font-medium text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent text-lg">stars</span>
                                Key Features
                            </h2>
                            <ul className="space-y-4">
                                {[
                                    { icon: "search", text: "Advanced search by name, EC number, plastic type, or organism" },
                                    { icon: "biotech", text: "Detailed biochemical properties, sequences, and structures" },
                                    { icon: "compare_arrows", text: "Integrated BLAST for sequence similarity searches" },
                                    { icon: "account_tree", text: "Interactive phylogenetic trees for evolutionary analysis" }
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-6 h-6 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-sm">{feature.icon}</span>
                                        </div>
                                        <span className="text-sm text-slate-600 leading-tight py-0.5">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                         <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-base font-medium text-primary mb-4">Data Sources & Quality</h2>
                                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                    Enzyme entries are integrated from PMBD, PlasticDB, and PAZY, verified against UniProt, NCBI, and PDB. Strict quality control ensures accurate sequence and structural data.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Contributing</h3>
                                <p className="text-xs text-slate-500">
                                    We welcome contributions. Please report errors or submit new enzyme data to our curation team.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Box - Inner Panel Style */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8">
                        <h3 className="text-base font-medium text-primary mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400 text-lg">contact_support</span>
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</span>
                                <a href="mailto:sci.igem@xjtlu.edu.cn" className="text-sm text-primary hover:text-accent font-medium transition-colors flex items-center gap-1">
                                    sci.igem@xjtlu.edu.cn
                                </a>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Institution</span>
                                <span className="text-sm text-primary font-medium">XJTLU-AI-CHINA</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Repository</span>
                                <a href="https://github.com/Tsutayaaa/PlaszymeDB" target="_blank" rel="noreferrer" className="text-sm text-primary hover:text-accent font-medium transition-colors flex items-center gap-1">
                                    GitHub <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                </a>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">update</span>
                            Last Updated: October 2025
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default About;