import React from 'react';

interface FooterProps {
    onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
    return (
        <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-md pt-12 pb-8 mt-auto relative z-10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 mb-10">
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-4">
                        <div className="flex items-center gap-3 text-primary cursor-pointer group" onClick={() => onNavigate('home')}>
                            <img 
                                src="assets/logo.svg" 
                                alt="PlaszymeDB Logo" 
                                className="w-8 h-8 object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                            />
                            <div className="flex flex-col">
                                <span className="font-display font-bold text-lg tracking-tight leading-none">Plaszyme<span className="text-accent font-light">DB</span></span>
                                <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">v2.4.0-beta</span>
                            </div>
                        </div>
                        <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                            A comprehensive functional database of plastic-degrading enzymes, dedicated to advancing research in environmental biotechnology and enzymatic recycling solutions.
                        </p>
                        <div className="flex items-center gap-2 pt-2">
                             <a href="https://github.com/Tsutayaaa/PlaszymeDB" target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-800 hover:text-slate-800 hover:bg-slate-50 transition-all" title="GitHub Repository">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                             </a>
                             <a href="https://igem.org/" target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-[#009b48] hover:text-[#009b48] hover:bg-emerald-50 transition-all" title="iGEM">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84a.484.484 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.488.488 0 0 0-.59.22L2.05 8.93a.49.49 0 0 0 .12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.27.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                                </svg>
                             </a>
                             <a href="mailto:sci.igem@xjtlu.edu.cn" className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-accent hover:text-accent hover:bg-blue-50 transition-all" title="Contact Us">
                                <span className="material-symbols-outlined text-lg">mail</span>
                             </a>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-2 md:col-start-6">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Discover</h4>
                        <ul className="space-y-2.5">
                            <li><button onClick={() => onNavigate('home')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">Home</button></li>
                            <li><button onClick={() => onNavigate('browse')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">Browse Database</button></li>
                            <li><button onClick={() => onNavigate('blast')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">BLAST Search</button></li>
                            <li><button onClick={() => onNavigate('phylogeny')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">Phylogeny</button></li>
                        </ul>
                    </div>

                    {/* Resources Links */}
                    <div className="md:col-span-2">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Resources</h4>
                        <ul className="space-y-2.5">
                            <li><button onClick={() => onNavigate('about')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">Documentation</button></li>
                            <li><button onClick={() => onNavigate('about')} className="text-xs text-slate-500 hover:text-accent transition-colors text-left">Methodology</button></li>
                            <li><a href="#" className="text-xs text-slate-500 hover:text-accent transition-colors text-left block">Download Data</a></li>
                        </ul>
                    </div>

                    {/* Institution Info */}
                    <div className="md:col-span-3">
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Affiliation</h4>
                        <ul className="space-y-4">
                            <li className="flex flex-col gap-0.5">
                                <strong className="text-primary text-xs font-medium">XJTLU-AI-CHINA</strong>
                                <span className="text-xs text-slate-500">iGEM Competition Team</span>
                            </li>
                            <li className="flex flex-col gap-0.5">
                                <span className="text-xs text-slate-500">Xi'an Jiaotong-Liverpool University</span>
                                <span className="text-xs text-slate-500">Suzhou, China</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-[10px] font-mono">
                        © {new Date().getFullYear()} PlaszymeDB. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-slate-400 text-[10px] font-medium tracking-wide">
                        <a href="#" className="hover:text-primary transition-colors">MIT LICENSE</a>
                        <a href="#" className="hover:text-primary transition-colors">TERMS</a>
                        <a href="#" className="hover:text-primary transition-colors">SITEMAP</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;