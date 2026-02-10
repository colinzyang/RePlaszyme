import React, { useEffect, useRef, useState } from 'react';
import { Enzyme, PlasticType, StructureSource } from '../types';

// Import Nightingale components
import '@nightingale-elements/nightingale-manager';
import '@nightingale-elements/nightingale-navigation';
import '@nightingale-elements/nightingale-sequence';

interface EnzymeDetailProps {
    enzyme: Enzyme;
    onBack: () => void;
}

// Wrappers for custom elements to bypass TypeScript JSX intrinsic element checking
const PdbeMolstar = (props: any) => React.createElement('pdbe-molstar', props);
const NightingaleManager = (props: any) => React.createElement('nightingale-manager', props);
const NightingaleNavigation = (props: any) => React.createElement('nightingale-navigation', props);
const NightingaleSequence = (props: any) => React.createElement('nightingale-sequence', props);

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

    // Refs for interaction logic
    const molstarRef = useRef<any>(null);
    const nightingaleRef = useRef<any>(null);

    // Loading state for 3D viewer
    const [isStructureLoading, setIsStructureLoading] = useState(true);
    const [structureError, setStructureError] = useState<string | null>(null);

    // Setup Bidirectional Interaction and Loading States
    useEffect(() => {
        const molstarNode = molstarRef.current;
        const nightingaleNode = nightingaleRef.current;

        // Reset loading state when enzyme changes
        setIsStructureLoading(true);
        setStructureError(null);

        if (!molstarNode || !nightingaleNode) return;

        // Listen for Mol* ready event
        const handleMolstarReady = () => {
            setIsStructureLoading(false);
        };

        const handleMolstarError = () => {
            setIsStructureLoading(false);
            setStructureError('Failed to load structure. The PDB file may not be available.');
        };

        // 1. Structure -> Sequence (Mol* to Nightingale)
        // Listen for Mol* hover events using the PDBe custom event
        const handleMolstarHover = (e: any) => {
            const eventData = e.eventData;
            if (eventData && eventData.residueNumber) {
                // Highlight the residue in Nightingale
                // Format: "start:end"
                const resNum = eventData.residueNumber;
                nightingaleNode.setAttribute('highlight', `${resNum}:${resNum}`);
            } else {
                nightingaleNode.removeAttribute('highlight');
            }
        };

        // Attach Mol* listener to document (PDBe dispatches to document)
        document.addEventListener('PDB.molstar.mouseover', handleMolstarHover);
        document.addEventListener('PDB.molstar.click', handleMolstarHover);
        document.addEventListener('PDB.molstar.loaded', handleMolstarReady);
        document.addEventListener('PDB.molstar.error', handleMolstarError);

        // Set a timeout fallback for loading state
        const loadingTimeout = setTimeout(() => {
            setIsStructureLoading(false);
        }, 10000); // 10 second timeout

        return () => {
            document.removeEventListener('PDB.molstar.mouseover', handleMolstarHover);
            document.removeEventListener('PDB.molstar.click', handleMolstarHover);
            document.removeEventListener('PDB.molstar.loaded', handleMolstarReady);
            document.removeEventListener('PDB.molstar.error', handleMolstarError);
            clearTimeout(loadingTimeout);
        };
    }, [enzyme.id]);


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

    const copySequence = () => {
        navigator.clipboard.writeText(enzyme.sequence);
    };

    // Structure configuration with S3 support
    const getStructureConfig = () => {
        // Priority 1: S3 structure using Plaszyme ID
        // Always attempt to load from S3 first using the pattern: ${plaszymeId}.pdb
        const s3Url = `https://plaszyme-assets.s3.us-east-1.amazonaws.com/pdb_predicted/${enzyme.plaszymeId}.pdb`;

        // Use S3 as primary source (474 PDB files are hosted)
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
                        
                        {/* 3D Structure Card - Inner Panel Style */}
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

                                {/* PDBe Molstar Web Component - Always use S3 URL */}
                                <PdbeMolstar
                                    ref={molstarRef}
                                    key={structureConfig.url}
                                    custom-data-url={structureConfig.url}
                                    custom-data-format="pdb"
                                    hide-controls="true"
                                    bg-color-r="248"
                                    bg-color-g="250"
                                    bg-color-b="252"
                                    visual-style="cartoon"
                                    lighting="matte"
                                    hide-water="true"
                                    subscribe-events="true"
                                    className="w-full h-full"
                                ></PdbeMolstar>

                                {/* Controls Overlay Hint */}
                                <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <span className="text-[10px] text-slate-500 font-medium">
                                        Predicted PDB Structure from S3
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Sequence Viewer Card - Updated to Nightingale */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                 <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-accent text-sm">linear_scale</span>
                                    Interactive Sequence (Nightingale)
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
                                <div className="w-full overflow-x-auto pb-2">
                                    {/* Nightingale Web Components */}
                                    <NightingaleManager 
                                        ref={nightingaleRef}
                                        length={enzyme.length}
                                        height="100"
                                        width="800" // Acts as a base width, scales with CSS
                                        class="w-full"
                                    >
                                        <div className="flex flex-col gap-1">
                                            {/* Navigation Track */}
                                            <NightingaleNavigation 
                                                length={enzyme.length}
                                                height="40"
                                                width="800"
                                            ></NightingaleNavigation>
                                            
                                            {/* Sequence Track */}
                                            <NightingaleSequence 
                                                sequence={enzyme.sequence}
                                                length={enzyme.length}
                                                width="800"
                                                height="40"
                                                display-start="1"
                                                display-end={Math.min(enzyme.length, 60)} // Start zoomed in slightly
                                                highlight-event="onmouseover" // Attempt to trigger native highlight
                                            ></NightingaleSequence>
                                        </div>
                                    </NightingaleManager>
                                </div>
                                <div className="mt-2 text-[10px] text-slate-400 italic text-center">
                                    Hover over structure to highlight sequence. (Feature tracks coming soon for click-to-select).
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Sidebar (1/3 width) */}
                    <div className="lg:col-span-1 space-y-6">
                        
                        {/* Substrate Card - Inner Panel Style */}
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

                        {/* Taxonomy & Source - Inner Panel Style */}
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

                        {/* External Database Links - Inner Panel Style */}
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
                                <h4 className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                                     <span className="material-symbols-outlined text-xs">menu_book</span> Primary Reference
                                </h4>
                                <p className="text-[10px] text-amber-900/80 leading-relaxed italic">
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