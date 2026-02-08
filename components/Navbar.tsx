import React from 'react';

interface NavbarProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
    const navLinkClass = (page: string) => 
        `text-sm font-medium transition-colors cursor-pointer ${currentPage === page ? 'text-primary relative after:absolute after:bottom-[-20px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-accent after:rounded-full' : 'text-slate-500 hover:text-primary'}`;

    const handleDownload = () => {
        // Create a dummy CSV file for the whole database download simulation
        const csvContent = "data:text/csv;charset=utf-8,Accession,Name,Organism,EC Number,Type\nA0A0K8P6T7,IsPETase,Ideonella sakaiensis,3.1.1.101,PET\nA0A1F5,LCC,Uncultured bacterium,3.1.1.74,PET;PLA\nQ9Z4P9,TfCut2,Thermobifida fusca,3.1.1.74,PET";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "PlaszymeDB_Full_v2.4.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4">
            <nav className="glass-panel rounded-full px-6 py-3 flex items-center justify-between w-full max-w-[1024px] shadow-lg shadow-black/5">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
                    <div className="text-accent flex items-center justify-center w-8 h-8 rounded-full bg-accent/10 border border-accent/20">
                        <span className="material-symbols-outlined text-[20px]">recycling</span>
                    </div>
                    <h2 className="text-primary text-base font-semibold tracking-tight">
                        Plaszyme<span className="text-accent font-light">DB</span>
                    </h2>
                </div>
                
                <div className="hidden md:flex items-center gap-8">
                    <span className={navLinkClass('home')} onClick={() => onNavigate('home')}>Home</span>
                    <span className={navLinkClass('browse')} onClick={() => onNavigate('browse')}>Browse</span>
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