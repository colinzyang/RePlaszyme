import React, { useState } from 'react';
import { analyzeProteinSequence } from '@/services/predictionService';
import { ALL_SUBSTRATE_TYPES } from '../types';

const Blast: React.FC = () => {
    const [sequence, setSequence] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    // Search Parameters State
    const [maxResults, setMaxResults] = useState('100');
    const [similarityThreshold, setSimilarityThreshold] = useState('30');
    const [plasticFilter, setPlasticFilter] = useState('');
    const [onlyStructure, setOnlyStructure] = useState(false);

    const loadExample = () => {
        setSequence("MNFPRASRLMQAAVLGGLMAVSAAATAQTNPYARGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCS");
    };

    const handleBlast = async () => {
        if (!sequence) return;
        setIsRunning(true);
        setResult(null);
        
        // Simulating BLAST via Gemini for the demo
        // In a real app, we would pass the search parameters to the backend here
        const analysis = await analyzeProteinSequence(sequence);
        
        setIsRunning(false);
        setResult(analysis);
    };

    return (
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden">
                
                {/* Standardized Header */}
                <header className="mb-8 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-2 mb-1 text-accent">
                        <span className="material-symbols-outlined text-lg">science</span>
                        <span className="text-[10px] font-bold tracking-wider uppercase">Sequence Analysis</span>
                    </div>
                    <h1 className="text-2xl font-light text-primary">BLAST Search</h1>
                    <p className="text-slate-500 text-xs mt-2 max-w-2xl">
                        Identify homologous sequences in PlaszymeDB using local alignment.
                    </p>
                </header>

                <div className="relative z-10 flex flex-col gap-6">
                    
                    {/* Input Section - Inner Panel Style */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-base">code</span>
                                Input Sequence (FASTA)
                            </label>
                            <button onClick={loadExample} className="text-[10px] text-accent hover:underline font-medium">Load Example (IsPETase)</button>
                        </div>
                        <textarea 
                            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[10px] md:text-xs text-slate-700 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all resize-none mb-4"
                            placeholder=">Sequence_ID&#10;MKAIL..."
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                            spellCheck={false}
                        ></textarea>
                        
                        {/* Search Parameters Container */}
                        <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">tune</span>
                                Search Configuration
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                {/* Maximum Results */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-medium text-slate-500">Maximum Results</label>
                                    <select 
                                        value={maxResults}
                                        onChange={(e) => setMaxResults(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-2 focus:border-accent outline-none text-slate-700"
                                    >
                                        <option value="10">10 matches</option>
                                        <option value="50">50 matches</option>
                                        <option value="100">100 matches</option>
                                        <option value="500">500 matches</option>
                                    </select>
                                </div>

                                {/* Similarity Threshold */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-medium text-slate-500">Similarity Threshold</label>
                                    <select 
                                        value={similarityThreshold}
                                        onChange={(e) => setSimilarityThreshold(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-2 focus:border-accent outline-none text-slate-700"
                                    >
                                        <option value="30">&gt; 30%</option>
                                        <option value="50">&gt; 50%</option>
                                        <option value="70">&gt; 70%</option>
                                        <option value="90">&gt; 90%</option>
                                    </select>
                                </div>

                                {/* Plastic Type Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-medium text-slate-500">Plastic Substrate</label>
                                     <select 
                                        value={plasticFilter}
                                        onChange={(e) => setPlasticFilter(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-2 focus:border-accent outline-none text-slate-700"
                                     >
                                        <option value="">All Types</option>
                                        {ALL_SUBSTRATE_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Include Structure */}
                                 <div className="flex flex-col gap-1.5 justify-end h-full">
                                    <label className="flex items-center gap-2 cursor-pointer p-2 border border-slate-200 rounded-lg bg-white hover:border-accent/50 transition-colors h-[34px]">
                                        <input 
                                            type="checkbox" 
                                            checked={onlyStructure}
                                            onChange={(e) => setOnlyStructure(e.target.checked)}
                                            className="w-3.5 h-3.5 rounded text-accent border-slate-300 focus:ring-accent" 
                                        />
                                        <span className="text-[10px] font-medium text-slate-600">Only with Structure</span>
                                    </label>
                                </div>
                            </div>

                            <button 
                                onClick={handleBlast}
                                disabled={isRunning || !sequence}
                                className="w-full bg-accent hover:bg-accent-glow text-white rounded-xl py-2.5 text-sm font-medium shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.99]"
                            >
                                {isRunning ? 'Running BLAST...' : 'Run Alignment'}
                                {!isRunning && <span className="material-symbols-outlined text-sm">play_arrow</span>}
                            </button>
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                            <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                                    Alignment Successful
                                </h3>
                                <div className="flex gap-2">
                                     <button className="text-[10px] border border-emerald-200 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-700 font-medium transition-colors">Download FASTA</button>
                                </div>
                            </div>
                            
                            <div className="p-4">
                                {/* Simulated Table */}
                                <div className="overflow-x-auto mb-4 rounded-lg border border-slate-200">
                                    <table className="w-full text-xs text-left">
                                        <thead className="text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-bold tracking-wider text-[10px]">
                                            <tr>
                                                <th className="px-4 py-3">Accession</th>
                                                <th className="px-4 py-3">Description</th>
                                                <th className="px-4 py-3">Max Score</th>
                                                <th className="px-4 py-3">Query Cover</th>
                                                <th className="px-4 py-3">E-value</th>
                                                <th className="px-4 py-3">Per. Ident</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-slate-700 divide-y divide-slate-100">
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-accent font-medium cursor-pointer">A0A0K8P6T7</td>
                                                <td className="px-4 py-3">Poly(ethylene terephthalate) hydrolase [Ideonella sakaiensis]</td>
                                                <td className="px-4 py-3">582</td>
                                                <td className="px-4 py-3">100%</td>
                                                <td className="px-4 py-3">0.0</td>
                                                <td className="px-4 py-3">100.00%</td>
                                            </tr>
                                            <tr className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-4 py-3 text-accent font-medium cursor-pointer">6EQE_A</td>
                                                <td className="px-4 py-3">Chain A, Poly(ethylene terephthalate) hydrolase [Mutant]</td>
                                                <td className="px-4 py-3">578</td>
                                                <td className="px-4 py-3">99%</td>
                                                <td className="px-4 py-3">1e-178</td>
                                                <td className="px-4 py-3">99.15%</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs text-slate-600">
                                    <h4 className="font-bold mb-2 flex items-center gap-2 text-primary text-[10px] uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-accent text-sm">smart_toy</span>
                                        AI Interpretation
                                    </h4>
                                    <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blast;