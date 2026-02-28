import React from 'react';

interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
    const navLinkClass = (page: string) => 
        `text-sm font-medium transition-colors cursor-pointer ${currentPage === page ? 'text-primary relative after:absolute after:bottom-[-20px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-accent after:rounded-full' : 'text-slate-500 hover:text-primary'}`;

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = "/PlaszymeDB_v1.1.csv";
        link.download = "PlaszymeDB_v1.1.csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
            <nav className="glass-panel rounded-full px-6 py-3 flex items-center justify-between w-full max-w-6xl shadow-lg shadow-black/5">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
                    <img src="assets/logo.svg" alt="PlaszymeDB Logo" className="w-9 h-9 object-contain" />
                    <h2 className="text-primary text-base font-semibold tracking-tight">
                        Plaszyme<span className="text-accent font-light">DB</span>
                    </h2>
                </div>
                
                <div className="hidden md:flex items-center gap-8">
                    <span className={navLinkClass('home')} onClick={() => onNavigate('home')}>Home</span>
                    <span className={navLinkClass('browse')} onClick={() => onNavigate('browse')}>Browse</span>
                    <span className={navLinkClass('predictor')} onClick={() => onNavigate('predictor')}>Predictor</span>
                    <span className={navLinkClass('blast')} onClick={() => onNavigate('blast')}>BLAST</span>
                    <span className={navLinkClass('phylogeny')} onClick={() => onNavigate('phylogeny')}>Phylogeny</span>
                    <span className={navLinkClass('about')} onClick={() => onNavigate('about')}>About</span>
                </div>

                <div className="flex items-center">
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-primary transition-all border border-slate-200 hover:border-slate-300 text-xs font-medium"
                    >
                        <span className="material-symbols-outlined text-[16px]">download</span>
                        <span>Download</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;