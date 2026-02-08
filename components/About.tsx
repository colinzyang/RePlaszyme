import React from 'react';

const About: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-8 md:p-12 md:px-16 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-accent/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <header className="border-b border-slate-200 pb-8 mb-10 relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-accent">
                        <span className="material-symbols-outlined">description</span>
                        <span className="text-xs font-bold tracking-wider uppercase">Documentation</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-primary mb-6">About PlaszymeDB</h1>
                    <p className="text-lg text-slate-500 font-light leading-relaxed max-w-2xl">
                        A comprehensive database dedicated to plastic-degrading enzymes, providing researchers worldwide with detailed information about enzymes capable of breaking down various plastic polymers.
                    </p>
                </header>

                <div className="relative z-10">
                    
                    {/* Database Overview */}
                    <section className="mb-12">
                        <h2 className="text-xl font-medium text-primary mb-4 flex items-center gap-2">
                            Database Overview
                        </h2>
                        <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4 text-justify">
                            <p>
                                The database currently contains <strong className="text-primary font-semibold">474</strong> plastic-degrading enzymes from diverse microorganisms that have been reported in the scientific literature for their plastic biodegradation capabilities. These enzymes target <strong className="text-primary font-semibold">34</strong> different types of plastic polymers, with detailed characterization data including 3D structures, phylogenetic relationships, and kinetic parameters where available.
                            </p>
                            <p>
                                PlaszymeDB is updated regularly to incorporate new discoveries and research findings in the rapidly evolving field of plastic biodegradation. The database serves as a central resource for researchers working on plastic pollution solutions, enzyme engineering, and environmental biotechnology applications.
                            </p>
                        </div>
                    </section>

                    {/* Features - Independent Block */}
                    <section className="mb-12 -mx-4 md:-mx-8">
                        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/60 p-6 md:p-8 mx-4 md:mx-0">
                            <h2 className="text-xl font-medium text-primary mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-accent">stars</span>
                                Database Features
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { icon: "search", text: "Advanced search by name, EC number, plastic type, or organism" },
                                    { icon: "biotech", text: "Detailed biochemical properties, sequences, and structures" },
                                    { icon: "compare_arrows", text: "Integrated BLAST for sequence similarity searches" },
                                    { icon: "account_tree", text: "Interactive phylogenetic trees for evolutionary analysis" },
                                    { icon: "bar_chart", text: "Visual statistics of enzyme distribution and properties" },
                                    { icon: "download", text: "Bulk data download in standard formats" }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-accent/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">
                                            <span className="material-symbols-outlined text-lg">{feature.icon}</span>
                                        </div>
                                        <span className="text-sm text-slate-600 leading-tight py-1">{feature.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Data Sources */}
                    <section className="mb-10">
                        <h2 className="text-xl font-medium text-primary mb-4">Data Sources and Quality</h2>
                        <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4 text-justify">
                            <p>
                                The enzyme items in PlaszymeDB have mainly been integrated and collected from within the degradation enzyme databases (such as PMBD, PlasticDB, PAZY), and have undergone comparison and verification with biological databases (such as UniProt, NCBI and PDB). Each entry contains diverse information and is internally displayed.
                            </p>
                            <p>
                                The database maintains strict quality control standards, with regular validation of sequence data, structural information, and literature references. Cross-references to external databases ensure data consistency and provide users with access to additional resources and information.
                            </p>
                        </div>
                    </section>

                    <hr className="border-slate-200 my-8" />

                    {/* Contributing */}
                    <section className="mb-10">
                        <h2 className="text-xl font-medium text-primary mb-4">Contributing to PlaszymeDB</h2>
                        <div className="text-slate-600 text-sm md:text-base leading-relaxed space-y-4">
                            <p>
                                We welcome contributions from the scientific community to improve and expand the database. If you have information about plastic-degrading enzymes that could enhance our collection, or if you notice any errors or omissions, please contact us with your suggestions.
                            </p>
                            <p>
                                We actively monitor the literature for new discoveries and appreciate notifications about recent publications or newly characterized enzymes that should be included in future database updates.
                            </p>
                        </div>
                    </section>

                    {/* Contact Info Box - Light Theme */}
                    <div className="bg-slate-50 rounded-2xl p-6 md:p-8 border border-slate-200">
                        <h3 className="text-lg font-medium text-primary mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">contact_support</span>
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</span>
                                <a href="mailto:sci.igem@xjtlu.edu.cn" className="text-primary hover:text-accent font-medium transition-colors">sci.igem@xjtlu.edu.cn</a>
                            </div>
                            <div>
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Institution</span>
                                <span className="text-primary font-medium">XJTLU-AI-CHINA</span>
                            </div>
                            <div className="md:col-span-2">
                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">GitHub</span>
                                <a href="https://github.com/Tsutayaaa/PlaszymeDB" target="_blank" rel="noreferrer" className="text-primary hover:text-accent font-medium transition-colors break-all">
                                    https://github.com/Tsutayaaa/PlaszymeDB
                                </a>
                            </div>
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-400 flex items-center gap-1">
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