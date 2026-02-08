import React, { useState } from 'react';
import { analyzeProteinSequence } from '../services/geminiService';
import { PlasticType } from '../types';

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
        <div className="max-w-4xl mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-8 md:p-12 md:px-16 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-accent/5 to-transparent rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <header className="border-b border-slate-200 pb-8 mb-10 relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-accent">
                        <span className="material-symbols-outlined">science</span>
                        <span className="text-xs font-bold tracking-wider uppercase">Sequence Analysis</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light text-primary mb-6">BLAST Search</h1>
                </header>

                <div className="relative z-10">
                    {/* Input Section */}
                    <div className="bg-white/50 rounded-2xl p-0 md:p-2 mb-8">
                        <div className="flex justify-between items-center mb-4 px-1">
                            <label className="text-sm font-semibold text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">code</span>
                                Input Sequence (FASTA)
                            </label>
                            <button onClick={loadExample} className="text-xs text-accent hover:underline font-medium">Load Example (IsPETase)</button>
                        </div>
                        <textarea 
                            className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs md:text-sm text-slate-700 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all resize-none shadow-inner"
                            placeholder=">Sequence_ID&#10;MKAIL..."
                            value={sequence}
                            onChange={(e) => setSequence(e.target.value)}
                            spellCheck={false}
                        ></textarea>
                        
                        {/* Search Parameters */}
                        <div className="mt-6 border-t border-slate-100 pt-6 px-1">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">tune</span>
                                Search Parameters
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                
                                {/* Maximum Results */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-medium text-slate-500">Maximum Results</label>
                                    <select 
                                        value={maxResults}
                                        onChange={(e) => setMaxResults(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:border-accent outline-none text-slate-700"
                                    >
                                        <option value="10">10 matches</option>
                                        <option value="50">50 matches</option>
                                        <option value="100">100 matches</option>
                                        <option value="500">500 matches</option>
                                    </select>
                                </div>

                                {/* Similarity Threshold */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-medium text-slate-500">Similarity Threshold</label>
                                    <select 
                                        value={similarityThreshold}
                                        onChange={(e) => setSimilarityThreshold(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:border-accent outline-none text-slate-700"
                                    >
                                        <option value="30">&gt; 30%</option>
                                        <option value="50">&gt; 50%</option>
                                        <option value="70">&gt; 70%</option>
                                        <option value="90">&gt; 90%</option>
                                    </select>
                                </div>

                                {/* Plastic Type Filter */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[11px] font-medium text-slate-500">Plastic Substrate</label>
                                     <select 
                                        value={plasticFilter}
                                        onChange={(e) => setPlasticFilter(e.target.value)}
                                        className="bg-white border border-slate-200 rounded-lg text-xs py-2 px-3 focus:border-accent outline-none text-slate-700"
                                     >
                                        <option value="">All Types</option>
                                        {Object.values(PlasticType).map(t => (
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
                                        <span className="text-[11px] font-medium text-slate-600">Only with Structure</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button 
                                    onClick={handleBlast}
                                    disabled={isRunning || !sequence}
                                    className="w-full sm:w-auto px-10 py-3 bg-accent hover:bg-accent-glow text-white rounded-xl font-medium shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                                >
                                    {isRunning ? 'Running BLAST...' : 'Run BLAST'}
                                    {!isRunning && <span className="material-symbols-outlined text-sm">play_arrow</span>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="bg-slate-50/80 rounded-2xl p-6 border-l-4 border-emerald-500 animate-fade-in-up shadow-sm">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-lg font-medium text-primary flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                    Alignment Results
                                </h3>
                                <div className="flex gap-2">
                                     <button className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors">Download FASTA</button>
                                     <button className="text-xs border border-slate-200 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 font-medium transition-colors">Download CSV</button>
                                </div>
                            </div>
                            
                            {/* Simulated Table */}
                            <div className="overflow-x-auto mb-6 bg-white rounded-xl border border-slate-200 shadow-sm">
                                <table className="w-full text-xs text-left">
                                    <thead className="text-slate-500 bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Accession</th>
                                            <th className="px-4 py-3 font-semibold">Description</th>
                                            <th className="px-4 py-3 font-semibold">Max Score</th>
                                            <th className="px-4 py-3 font-semibold">Query Cover</th>
                                            <th className="px-4 py-3 font-semibold">E-value</th>
                                            <th className="px-4 py-3 font-semibold">Per. Ident</th>
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

                            <div className="bg-white rounded-xl p-5 border border-slate-200 text-sm text-slate-600 shadow-sm">
                                <h4 className="font-semibold mb-3 flex items-center gap-2 text-primary">
                                    <span className="material-symbols-outlined text-accent text-lg">smart_toy</span>
                                    AI Interpretation
                                </h4>
                                <div className="leading-relaxed" dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, '<br/>') }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blast;