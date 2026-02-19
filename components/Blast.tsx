import React, { useState } from 'react';
import { blastSearch, getEnzymeById } from '@/services/api/databaseService';
import { ALL_SUBSTRATE_TYPES, BlastHit, BlastResponse, Enzyme } from '../types';

interface BlastProps {
    onSelectEnzyme?: (enzyme: Enzyme) => void;
}

const Blast: React.FC<BlastProps> = ({ onSelectEnzyme }) => {
    const [sequence, setSequence] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // BLAST results state
    const [results, setResults] = useState<BlastResponse | null>(null);

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
        setError(null);
        setResults(null);

        try {
            const response = await blastSearch({
                sequence,
                max_results: parseInt(maxResults),
                similarity_threshold: similarityThreshold,
                plastic_types: plasticFilter ? [plasticFilter] : undefined,
                require_structure: onlyStructure,
            });

            setResults(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'BLAST search failed');
        } finally {
            setIsRunning(false);
        }
    };

    const handleHitClick = async (hit: BlastHit) => {
        if (onSelectEnzyme) {
            try {
                // Fetch complete enzyme data from API
                const fullEnzyme = await getEnzymeById(hit.plaszyme_id);
                onSelectEnzyme(fullEnzyme);
            } catch (error) {
                console.error('Failed to fetch enzyme details:', error);
            }
        }
    };

    const formatEValue = (eValue: number): string => {
        if (eValue === 0) return '0.0';
        if (eValue < 1e-100) return eValue.toExponential(2);
        if (eValue < 0.001) return eValue.toExponential(2);
        return eValue.toFixed(2);
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
                        Identify homologous sequences in PlaszymeDB using local Smith-Waterman alignment with BLOSUM62 matrix.
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

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
                            <div className="flex items-center gap-2 text-red-700">
                                <span className="material-symbols-outlined">error</span>
                                <span className="text-sm font-medium">Error</span>
                            </div>
                            <p className="text-xs text-red-600 mt-1">{error}</p>
                        </div>
                    )}

                    {/* Results Section */}
                    {results && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                            <div className="bg-emerald-50/50 px-5 py-4 border-b border-emerald-100 flex justify-between items-center">
                                <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-500 text-base">check_circle</span>
                                    Alignment Complete
                                </h3>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                                    <span>{results.results.length} hits</span>
                                    <span>{results.execution_time_ms.toFixed(0)}ms</span>
                                </div>
                            </div>

                            <div className="p-4">
                                {/* Query Info */}
                                <div className="mb-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-600">
                                    <div className="flex gap-6">
                                        <span><strong>Query Length:</strong> {results.query_info.length} aa</span>
                                        <span><strong>Database:</strong> {results.total} sequences</span>
                                        {results.filtered !== results.total && (
                                            <span><strong>Filtered:</strong> {results.filtered} sequences</span>
                                        )}
                                    </div>
                                </div>

                                {/* Results Table */}
                                {results.results.length > 0 ? (
                                    <div className="overflow-x-auto mb-4 rounded-lg border border-slate-200">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-slate-500 bg-slate-50 border-b border-slate-200 uppercase font-bold tracking-wider text-[11px]">
                                                <tr>
                                                    <th className="px-5 py-4">ID</th>
                                                    <th className="px-5 py-4">Description</th>
                                                    <th className="px-5 py-4 text-right">Score</th>
                                                    <th className="px-5 py-4 text-right">Query Cover</th>
                                                    <th className="px-5 py-4 text-right min-w-[100px] whitespace-nowrap">E-value</th>
                                                    <th className="px-5 py-4 text-right">Ident %</th>
                                                    <th className="px-5 py-4">Plastic Types</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-700 divide-y divide-slate-100">
                                                {results.results.map((hit, index) => (
                                                    <tr
                                                        key={hit.plaszyme_id + index}
                                                        onClick={() => handleHitClick(hit)}
                                                        className={`hover:bg-blue-50/50 transition-colors ${onSelectEnzyme ? 'cursor-pointer' : ''}`}
                                                    >
                                                        <td className="px-5 py-4 text-accent font-medium">
                                                            {hit.plaszyme_id}
                                                            {hit.has_structure && (
                                                                <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-2 py-1 rounded">3D</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="font-medium text-slate-800">{hit.description}</div>
                                                            <div className="text-xs text-slate-500 mt-1">{hit.organism}</div>
                                                        </td>
                                                        <td className="px-5 py-4 text-right font-mono">{hit.max_score}</td>
                                                        <td className="px-5 py-4 text-right font-mono">{hit.query_cover}%</td>
                                                        <td className="px-5 py-4 text-right font-mono whitespace-nowrap">{formatEValue(hit.e_value)}</td>
                                                        <td className="px-5 py-4 text-right font-mono">{hit.percent_identity.toFixed(2)}%</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex flex-wrap gap-1">
                                                                {hit.plastic_types.slice(0, 3).map(type => (
                                                                    <span key={type} className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded font-medium">
                                                                        {type}
                                                                    </span>
                                                                ))}
                                                                {hit.plastic_types.length > 3 && (
                                                                    <span className="text-[10px] text-slate-500">+{hit.plastic_types.length - 3}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2 block">search_off</span>
                                        <p className="text-sm">No matches found above {similarityThreshold}% identity threshold</p>
                                        <p className="text-xs mt-1">Try lowering the similarity threshold or removing filters</p>
                                    </div>
                                )}

                                {onSelectEnzyme && results.results.length > 0 && (
                                    <p className="text-xs text-slate-500 text-center mt-4">Click on a row to view enzyme details</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blast;
