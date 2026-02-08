import React from 'react';
import { Enzyme, PlasticType } from '../types';

interface EnzymeDetailProps {
    enzyme: Enzyme;
    onBack: () => void;
}

const getSubstrateImage = (type: PlasticType) => {
    switch(type) {
        case PlasticType.PET: return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Polyethylenterephthalat.svg/320px-Polyethylenterephthalat.svg.png";
        case PlasticType.PE: return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Polyethylene-repeat-2D.svg/320px-Polyethylene-repeat-2D.svg.png";
        case PlasticType.PP: return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Polypropylen_Kettensegment.svg/320px-Polypropylen_Kettensegment.svg.png";
        case PlasticType.PS: return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Polystyrene.svg/320px-Polystyrene.svg.png";
        case PlasticType.PUR: return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Polyurethane.svg/320px-Polyurethane.svg.png";
        case PlasticType.PLA: return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Polylactic_acid.svg/320px-Polylactic_acid.svg.png";
        case PlasticType.PHB: return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Polyhydroxybutyrate.svg/320px-Polyhydroxybutyrate.svg.png";
        default: return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Polyethylenterephthalat.svg/320px-Polyethylenterephthalat.svg.png";
    }
};

const EnzymeDetail: React.FC<EnzymeDetailProps> = ({ enzyme, onBack }) => {
    
    const downloadFasta = () => {
        const header = `>${enzyme.accession} | ${enzyme.name} | ${enzyme.organism}`;
        const formattedSeq = enzyme.sequence.match(/.{1,60}/g)?.join('\n') || enzyme.sequence;
        const content = `${header}\n${formattedSeq}`;
        
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${enzyme.accession}_${enzyme.name.replace(/\s+/g, '_')}.fasta`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const copySequence = () => {
        navigator.clipboard.writeText(enzyme.sequence);
    };

    return (
        <div className="animate-fade-in-up pb-12 space-y-6">
            
            {/* 1. Dashboard Header: Navigation & Key Identity */}
            <div className="glass-panel rounded-2xl p-6 border-l-4 border-l-accent shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm font-medium group">
                        <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Back to Search
                    </button>
                    <div className="flex gap-2">
                         <span className="px-3 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-xs font-mono font-bold">
                            {enzyme.accession}
                        </span>
                        <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-xs font-bold font-mono">
                            EC {enzyme.ecNumber}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div>
                         <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 tracking-tight">{enzyme.name}</h1>
                         <div className="text-lg text-slate-600 italic mt-1">
                             {enzyme.organism}
                         </div>
                    </div>
                    
                    {/* Quick Stats Row */}
                    <div className="flex gap-4 md:gap-8 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-8">
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Length</span>
                            <span className="text-lg font-mono font-medium text-slate-700">{enzyme.length} <span className="text-xs text-slate-400">aa</span></span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Mass</span>
                            <span className="text-lg font-mono font-medium text-slate-700">{enzyme.weight} <span className="text-xs text-slate-400">kDa</span></span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Opt. Temp</span>
                            <span className="text-lg font-mono font-medium text-slate-700">{enzyme.temperature}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Opt. pH</span>
                            <span className="text-lg font-mono font-medium text-slate-700">{enzyme.ph}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Structure & Sequence (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* 3D Structure Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">deployed_code</span>
                                3D Crystal Structure
                            </h3>
                            {enzyme.pdbId ? (
                                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded font-bold">
                                    PDB: {enzyme.pdbId}
                                </span>
                            ) : (
                                <span className="text-[10px] text-slate-400 italic">AlphaFold Predicted</span>
                            )}
                        </div>
                        <div className="relative h-[500px] w-full bg-slate-50">
                             {enzyme.pdbId ? (
                                // @ts-ignore
                                <pdbe-molstar 
                                    molecule-id={enzyme.pdbId}
                                    hide-controls="true"
                                    bg-color-r="248"
                                    bg-color-g="250"
                                    bg-color-b="252"
                                    className="w-full h-full"
                                ></pdbe-molstar>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">view_in_ar</span>
                                    <p>No experimental PDB structure available.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sequence Viewer Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                             <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                Amino Acid Sequence
                            </h3>
                            <div className="flex gap-2">
                                <button onClick={copySequence} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Copy to clipboard">
                                    <span className="material-symbols-outlined text-base">content_copy</span>
                                </button>
                                <button onClick={downloadFasta} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Download FASTA">
                                    <span className="material-symbols-outlined text-base">download</span>
                                </button>
                            </div>
                        </div>
                        <div className="p-5 overflow-x-auto">
                            <div className="font-mono text-xs md:text-sm text-slate-600 tracking-wider leading-loose break-all">
                                {enzyme.sequence}
                            </div>
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: Sidebar (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Substrate Card */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                         <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-500">recycling</span>
                                Target Substrate
                            </h3>
                        </div>
                        <div className="p-6 flex flex-col items-center">
                            <div className="w-full h-32 flex items-center justify-center mb-4 bg-white">
                                <img 
                                    src={getSubstrateImage(enzyme.plasticType[0])} 
                                    alt={`${enzyme.plasticType[0]} structure`}
                                    className="max-w-full max-h-full object-contain opacity-80" 
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center w-full">
                                {enzyme.plasticType.map(pt => (
                                    <span key={pt} className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold shadow-sm">
                                        {pt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Taxonomy & Source */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">account_tree</span>
                                Biological Source
                            </h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Organism</span>
                                <span className="text-sm font-medium text-slate-700 italic">{enzyme.organism}</span>
                            </div>
                            <div>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">Lineage</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {enzyme.taxonomy.split(';').map((tax, i) => (
                                        <span key={i} className="text-[11px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                            {tax.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* External Database Links */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">link</span>
                                Cross References
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            <a href={`https://www.ncbi.nlm.nih.gov/protein/${enzyme.accession}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                                <span className="text-xs font-medium text-slate-600">NCBI Protein</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                    {enzyme.accession} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </span>
                            </a>
                            <a href={`https://www.uniprot.org/uniprot/${enzyme.accession}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                                <span className="text-xs font-medium text-slate-600">UniProtKB</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                    {enzyme.accession} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                </span>
                            </a>
                            {enzyme.pdbId && (
                                <a href={`https://www.rcsb.org/structure/${enzyme.pdbId}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors group">
                                    <span className="text-xs font-medium text-slate-600">RCSB PDB</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                        {enzyme.pdbId} <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                    </span>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Reference */}
                    <div className="bg-amber-50/50 rounded-2xl border border-amber-100/50 p-5">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                             <span className="material-symbols-outlined text-sm">menu_book</span> Primary Reference
                        </h4>
                        <p className="text-xs text-amber-900/80 leading-relaxed italic">
                            "{enzyme.reference}"
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default EnzymeDetail;