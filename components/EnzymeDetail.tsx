import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Enzyme, StructureSource } from '../types';
import MolstarViewer from './MolstarViewer';

interface EnzymeDetailProps {
    enzyme: Enzyme;
    onBack: () => void;
}

const getSubstrateImage = (type: string) => {
    switch(type) {
        case 'PET': return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Polyethylenterephthalat.svg/320px-Polyethylenterephthalat.svg.png";
        case 'PE': return "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Polyethylene-repeat-2D.svg/320px-Polyethylene-repeat-2D.svg.png";
        case 'PP': return "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Polypropylen_Kettensegment.svg/320px-Polypropylen_Kettensegment.svg.png";
        case 'PS': return "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Polystyrene.svg/320px-Polystyrene.svg.png";
        case 'PUR': return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Polyurethane.svg/320px-Polyurethane.svg.png";
        case 'PLA': return "https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Polylactic_acid.svg/320px-Polylactic_acid.svg.png";
        case 'PHB': return "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Polyhydroxybutyrate.svg/320px-Polyhydroxybutyrate.svg.png";
        default: return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Polyethylenterephthalat.svg/320px-Polyethylenterephthalat.svg.png";
    }
};

const EnzymeDetail: React.FC<EnzymeDetailProps> = ({ enzyme, onBack }) => {

    // Refs for interaction logic
    const molstarContainerRef = useRef<HTMLDivElement>(null);
    const sequenceContainerRef = useRef<HTMLDivElement>(null);

    // Loading state for 3D viewer
    const [isStructureLoading, setIsStructureLoading] = useState(true);
    const [structureError, setStructureError] = useState<string | null>(null);
    const [highlightedResidue, setHighlightedResidue] = useState<number | null>(null);

    // Handle residue hover from Molstar
    const handleResidueHover = useCallback((residueNumber: number | null) => {
        // Could highlight sequence position in future
        setHighlightedResidue(residueNumber);
    }, []);

    // Handle residue click
    const handleResidueClick = useCallback((residueNumber: number) => {
        console.log('Clicked residue:', residueNumber);
        // Could scroll to position in sequence viewer or show info
    }, []);

    // Handle structure load complete
    const handleLoadComplete = useCallback(() => {
        setIsStructureLoading(false);
        setStructureError(null);
    }, []);

    // Handle structure load error
    const handleLoadError = useCallback((error: string) => {
        setIsStructureLoading(false);
        setStructureError(error);
    }, []);

    // Reset loading state when enzyme changes
    useEffect(() => {
        setIsStructureLoading(true);
        setStructureError(null);
        setHighlightedResidue(null);
    }, [enzyme.id]);

    // Download FASTA
    const downloadFasta = () => {
        const header = `>${enzyme.plaszymeId} | ${enzyme.name} | ${enzyme.organism}`;
        const formattedSeq = enzyme.sequence.match(/.{1,60}/g)?.join('\n') || enzyme.sequence;
        const content = `${header}\n${formattedSeq}`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${enzyme.plaszymeId}_${enzyme.name.replace(/\s+/g, '_')}.fasta`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Copy sequence to clipboard
    const copySequence = () => {
        navigator.clipboard.writeText(enzyme.sequence);
    };

    // Structure configuration with S3 support
    const getStructureConfig = () => {
        const s3Url = `https://plaszyme-assets.s3.us-east-1.amazonaws.com/pdb_predicted/${enzyme.plaszymeId}.pdb`;

        return {
            source: 's3' as StructureSource,
            url: s3Url,
            displayText: `Predicted Structure (${enzyme.plaszymeId})`,
            fallbackPdb: enzyme.pdbId,
            fallbackAlphaFold: enzyme.uniprotId || enzyme.accession
        };
    };

    const structureConfig = getStructureConfig();

    return (
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">

                {/* Header Section */}
                <div className="border-b border-slate-200 pb-8 mb-8">
                    {/* Navigation & IDs */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-xs font-medium group">
                            <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                            Back to Search
                        </button>
                        <div className="flex gap-2">
                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-mono font-bold">
                                {enzyme.plaszymeId}
                            </span>
                            <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold font-mono">
                                EC {enzyme.ecNumber}
                            </span>
                        </div>
                    </div>

                    {/* Main Title & Stats */}
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                             <h1 className="text-2xl md:text-3xl font-light text-primary mb-2 tracking-tight">
                                 {enzyme.name || 'Unnamed Enzyme'}
                             </h1>
                             <div className="text-sm text-slate-600 italic mt-1">
                                 {enzyme.organism || 'Unknown organism'}
                             </div>
                        </div>

                        {/* Quick Stats Row */}
                        <div className="flex gap-4 md:gap-8 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-8">
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Length</span>
                                <span className="text-base font-mono font-medium text-slate-700">{enzyme.length} <span className="text-[10px] text-slate-400">aa</span></span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Mass</span>
                                <span className="text-base font-mono font-medium text-slate-700">{enzyme.weight} <span className="text-[10px] text-slate-400">kDa</span></span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Opt. Temp</span>
                                <span className="text-base font-mono font-medium text-slate-700">{enzyme.temperature}</span>
                            </div>
                            <div>
                                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Opt. pH</span>
                                <span className="text-base font-mono font-medium text-slate-700">{enzyme.ph}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Structure & Sequence (2/3 width) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* 3D Structure Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500 text-sm">deployed_code</span>
                                    3D Structure Viewer
                                </h3>
                                <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-green-50 text-green-700 border border-green-100">
                                    {structureConfig.displayText}
                                </span>
                            </div>
                            <div className="relative h-[500px] w-full bg-slate-50 group">
                                {/* Loading Spinner Overlay */}
                                {isStructureLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent"></div>
                                            <p className="text-xs text-slate-500">Loading 3D structure...</p>
                                        </div>
                                    </div>
                                )}

                                {/* Error Message */}
                                {structureError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-20">
                                        <div className="flex flex-col items-center gap-3 text-center p-4">
                                            <span className="material-symbols-outlined text-4xl text-amber-400">warning</span>
                                            <p className="text-sm text-slate-600">{structureError}</p>
                                            {structureConfig.fallbackPdb && (
                                                <p className="text-xs text-slate-400">Fallback: Try PDB {structureConfig.fallbackPdb}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Molstar Viewer */}
                                <div ref={molstarContainerRef} className="w-full h-full">
                                    <MolstarViewer
                                        pdbUrl={structureConfig.url}
                                        onResidueHover={handleResidueHover}
                                        onResidueClick={handleResidueClick}
                                        onLoadComplete={handleLoadComplete}
                                        onLoadError={handleLoadError}
                                        height="500px"
                                    />
                                </div>

                                {/* Controls Overlay Hint */}
                                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        Hover to highlight sequence | Mol* Viewer
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sequence Viewer Card - Nightingale */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent text-sm">linear_scale</span>
                                    Interactive Sequence
                                    {highlightedResidue && (
                                        <span className="ml-2 text-accent font-normal">
                                            Residue: {highlightedResidue}
                                        </span>
                                    )}
                                </h3>
                                <div className="flex gap-2">
                                    <button onClick={copySequence} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Copy to clipboard">
                                        <span className="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                    <button onClick={downloadFasta} className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Download FASTA">
                                        <span className="material-symbols-outlined text-sm">download</span>
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 bg-white relative">
                                <div className="w-full overflow-x-auto pb-2 rounded-lg border border-slate-100" ref={sequenceContainerRef}>
                                    <div className="font-mono text-[11px] leading-[1.8] min-w-max bg-slate-50/50">
                                        {enzyme.sequence.match(/.{1,60}/g)?.map((line, i) => (
                                            <div key={i} className="flex hover:bg-slate-100/50 transition-colors px-2 py-0.5">
                                                <span className="text-slate-400 w-8 text-right pr-3 select-none flex-shrink-0 text-[10px]">{i * 60 + 1}</span>
                                                <span className="text-slate-700 tracking-[0.15em]">{line}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 italic text-center">
                                    Sequence length: {enzyme.length} amino acids
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sidebar (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">

                        {/* Substrate Card */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                             <div className="px-4 py-3 border-b border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-sm">recycling</span>
                                    Target Substrate
                                </h3>
                            </div>
                            <div className="p-6 flex flex-col items-center">
                                {enzyme.plasticType.length > 0 ? (
                                    <>
                                        <div className="w-full h-32 flex items-center justify-center mb-4 bg-white">
                                            <img
                                                src={getSubstrateImage(enzyme.plasticType[0])}
                                                alt={`${enzyme.plasticType[0]} structure`}
                                                className="max-w-full max-h-full object-contain opacity-80"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-2 justify-center w-full">
                                            {enzyme.plasticType.map(pt => (
                                                <span key={pt} className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[10px] font-bold shadow-sm">
                                                    {pt}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-6">
                                        <span className="material-symbols-outlined text-slate-300 text-4xl mb-2 block">question_mark</span>
                                        <p className="text-xs text-slate-400 italic">Substrate not specified</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Taxonomy & Source */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-500 text-sm">account_tree</span>
                                    Biological Source
                                </h3>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Organism</span>
                                    <span className="text-xs font-medium text-slate-700 italic">
                                        {enzyme.organism || 'Not specified'}
                                    </span>
                                </div>
                                {enzyme.taxonomy && enzyme.taxonomy.trim() && (
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Lineage</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {enzyme.taxonomy.split(';').map((tax, i) => (
                                                tax.trim() && (
                                                    <span key={i} className="text-[10px] text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                                                        {tax.trim()}
                                                    </span>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* External Database Links */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100">
                                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-slate-400 text-sm">link</span>
                                    Cross References
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                <div className="px-4 py-2.5 bg-slate-50/50">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700">Plaszyme ID</span>
                                        <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {enzyme.plaszymeId}
                                        </span>
                                    </div>
                                </div>
                                {enzyme.genbankId && (
                                    <a href={`https://www.ncbi.nlm.nih.gov/protein/${enzyme.genbankId}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group">
                                        <span className="text-xs font-medium text-slate-600">NCBI GenBank</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                            {enzyme.genbankId} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                        </span>
                                    </a>
                                )}
                                {enzyme.uniprotId && (
                                    <a href={`https://www.uniprot.org/uniprot/${enzyme.uniprotId}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group">
                                        <span className="text-xs font-medium text-slate-600">UniProtKB</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                            {enzyme.uniprotId} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                        </span>
                                    </a>
                                )}
                                {enzyme.pdbId && (
                                    <a href={`https://www.rcsb.org/structure/${enzyme.pdbId}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group">
                                        <span className="text-xs font-medium text-slate-600">RCSB PDB</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                            {enzyme.pdbId} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                        </span>
                                    </a>
                                )}
                                {enzyme.uniprotId && (
                                    <a href={`https://alphafold.ebi.ac.uk/entry/${enzyme.uniprotId}`} target="_blank" rel="noreferrer" className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors group">
                                        <span className="text-xs font-medium text-slate-600">AlphaFold DB</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1 group-hover:text-accent">
                                            {enzyme.uniprotId} <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                        </span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Reference */}
                        {enzyme.reference && enzyme.reference !== 'Unpublished' && (
                            <div className="bg-amber-50/50 rounded-xl border border-amber-100/50 p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                                         <span className="material-symbols-outlined text-xs">menu_book</span> Primary Reference
                                    </h4>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(enzyme.reference)}
                                        className="p-1 hover:bg-amber-100 rounded text-amber-600 transition-colors flex-shrink-0"
                                        title="Copy reference"
                                    >
                                        <span className="material-symbols-outlined text-xs">content_copy</span>
                                    </button>
                                </div>
                                <p className="text-[10px] text-amber-900/80 leading-relaxed italic break-words">
                                    "{enzyme.reference}"
                                </p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnzymeDetail;
