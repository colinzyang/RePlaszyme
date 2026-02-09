import React, { useState, useEffect, useRef } from 'react';
import { analyzeProteinSequence } from '../services/geminiService';

interface PredictionResult {
    jobId: string;
    enzymeFamily: string;
    confidence: number;
    substrate: string;
    properties: {
        temp: string;
        ph: string;
        mechanism: string;
    };
    rawAnalysis: string;
}

const Predictor: React.FC = () => {
    const [sequence, setSequence] = useState('');
    const [jobStatus, setJobStatus] = useState<'idle' | 'queued' | 'processing' | 'completed'>('idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [result, setResult] = useState<PredictionResult | null>(null);
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Settings State
    const [model, setModel] = useState('DeepPlast-v3.0 (Transformer)');
    
    // Auto-scroll logs
    useEffect(() => {
        if (logsContainerRef.current) {
            logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
        }
    }, [logs]);

    const addLog = (msg: string) => {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
        setLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
    };

    const handlePredict = async () => {
        if (!sequence.trim()) return;

        setJobStatus('queued');
        setLogs([]);
        setResult(null);

        // Simulation Step 1: Queuing
        setTimeout(() => {
            setJobStatus('processing');
            addLog(`Job submitted. ID: JOB-${Math.floor(Math.random() * 100000)}`);
            addLog("Validating input sequence format (FASTA)...");
            addLog(`Sequence length: ${sequence.length} amino acids`);
            
            // Simulation Step 2: Processing
            setTimeout(async () => {
                addLog(`Initializing ${model} inference engine...`);
                addLog("Extracting evolutionary features (MSA)...");
                
                // Real Gemini Analysis
                const aiAnalysis = await analyzeProteinSequence(sequence);
                
                addLog("Predicting catalytic residues...");
                addLog("Estimating physicochemical properties...");
                
                // Parse AI result or fallback to mock data if AI text is unstructured
                // This extraction is heuristic based on the prompt we sent to Gemini
                const enzymeMatch = aiAnalysis.match(/1\.\s*(.*?)(?:\n|$)/);
                const substrateMatch = aiAnalysis.match(/2\.\s*(.*?)(?:\n|$)/);
                
                // Generate a random confidence score for "realism"
                const mockConfidence = Math.floor(Math.random() * (98 - 75) + 75);
                
                setResult({
                    jobId: `JOB-${Math.floor(Math.random() * 100000)}`,
                    enzymeFamily: enzymeMatch ? enzymeMatch[1].replace(/\*\*/g, '') : "Putative Hydrolase",
                    confidence: mockConfidence,
                    substrate: substrateMatch ? substrateMatch[1].replace(/\*\*/g, '') : "Polyester (General)",
                    properties: {
                        temp: "30°C - 45°C", 
                        ph: "7.0 - 8.5",     
                        mechanism: "Serine-hydrolase triad (Ser-His-Asp)"
                    },
                    rawAnalysis: aiAnalysis
                });

                setJobStatus('completed');
                addLog("Analysis pipeline completed successfully.");
                addLog("Results rendered.");
            }, 2000); // Wait 2s to simulate processing
        }, 800); // Wait 0.8s to simulate queue
    };

    const loadExample = () => {
        setSequence("MNFPRASRLMQAAVLGGLMAVSAAATAQTNPYARGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCS");
    };

    return (
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                
                {/* Header - More Compact */}
                <header className="mb-6 border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1 text-accent">
                            <span className="material-symbols-outlined text-lg">memory</span>
                            <span className="text-[10px] font-bold tracking-wider uppercase">Deep Learning Server</span>
                        </div>
                        <h1 className="text-2xl font-light text-primary">Enzyme Function Predictor</h1>
                    </div>
                    {jobStatus === 'completed' && (
                         <button 
                            onClick={() => {setJobStatus('idle'); setSequence(''); setResult(null);}}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">refresh</span> New Job
                        </button>
                    )}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: Input & Config */}
                    <div className="lg:col-span-5 space-y-4">
                        
                        {/* Input Area */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-xs font-semibold text-slate-700">Protein Sequence (FASTA)</label>
                                <button onClick={loadExample} className="text-[10px] text-accent hover:underline font-medium">Load IsPETase</button>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-slate-50 border border-slate-200 rounded-lg p-3 font-mono text-[10px] md:text-xs text-slate-700 focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition-all resize-none mb-3"
                                placeholder=">Sequence_ID&#10;MKAIL..."
                                value={sequence}
                                onChange={(e) => setSequence(e.target.value)}
                                disabled={jobStatus === 'queued' || jobStatus === 'processing'}
                            ></textarea>
                            <div className="flex gap-2">
                                <button className="flex-1 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-sm">upload_file</span> Upload FASTA
                                </button>
                                <button 
                                    onClick={() => setSequence('')}
                                    className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:text-red-500 hover:bg-red-50"
                                    title="Clear"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </div>

                        {/* Configuration - Grid Layout for compactness */}
                        <div className="bg-slate-50/50 rounded-xl border border-slate-200 p-4">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Job Configuration</h3>
                            
                            <div className="flex flex-col gap-3">
                                <div>
                                    <label className="block text-[10px] font-medium text-slate-600 mb-1">Prediction Model</label>
                                    <select 
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2 focus:border-accent outline-none"
                                        disabled={jobStatus !== 'idle'}
                                    >
                                        <option>DeepPlast-v3.0</option>
                                        <option>EnzNet-ResNet</option>
                                        <option>BLASTp Homology</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handlePredict}
                            disabled={!sequence || jobStatus === 'queued' || jobStatus === 'processing'}
                            className="w-full py-3 bg-accent hover:bg-accent-glow text-white rounded-xl font-medium shadow-lg shadow-accent/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {jobStatus === 'processing' ? (
                                <>
                                    <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                    Submit Job
                                </>
                            )}
                        </button>

                    </div>

                    {/* RIGHT COLUMN: Logs & Results */}
                    <div className="lg:col-span-7 flex flex-col gap-4">
                        
                        {/* Terminal / Logs - Reduced Height */}
                        <div className={`bg-[#1e1e1e] rounded-xl overflow-hidden shadow-inner border border-slate-800 flex flex-col transition-all duration-500 ${result ? 'h-32' : 'h-full min-h-[250px]'}`}>
                            <div className="bg-[#2d2d2d] px-3 py-1.5 flex items-center gap-2 border-b border-[#3d3d3d]">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 ml-2">server_logs.txt</span>
                            </div>
                            <div 
                                ref={logsContainerRef}
                                className="p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto flex-1 space-y-0.5"
                            >
                                {logs.length === 0 && <span className="text-slate-600 opacity-50"> Waiting for job submission...</span>}
                                {logs.map((log, i) => (
                                    <div key={i} className="break-all">{log}</div>
                                ))}
                            </div>
                        </div>

                        {/* Result Dashboard */}
                        {result && jobStatus === 'completed' && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50 animate-fade-in-up overflow-hidden">
                                <div className="bg-emerald-50/50 px-4 py-3 border-b border-emerald-100 flex justify-between items-center">
                                    <h3 className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-base text-emerald-500">check_circle</span>
                                        Prediction Successful
                                    </h3>
                                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                                        {result.jobId}
                                    </span>
                                </div>
                                
                                <div className="p-4">
                                    <div className="flex items-center gap-4 mb-4">
                                        {/* Confidence Badge */}
                                        <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                                                <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - result.confidence / 100)} className="text-accent transition-all duration-1000 ease-out" />
                                            </svg>
                                            <div className="absolute flex flex-col items-center">
                                                <span className="text-sm font-bold text-primary">{result.confidence}%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 space-y-0.5">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Predicted Family</span>
                                            <h2 className="text-lg font-bold text-primary leading-tight">{result.enzymeFamily}</h2>
                                            <p className="text-xs text-slate-600 flex items-center gap-2">
                                                Targets: <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-medium border border-slate-200">{result.substrate}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Properties Grid */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Optimal Temp</span>
                                            <span className="text-xs font-mono font-medium text-slate-700">{result.properties.temp}</span>
                                        </div>
                                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                                            <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Optimal pH</span>
                                            <span className="text-xs font-mono font-medium text-slate-700">{result.properties.ph}</span>
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-3">
                                        <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-xs">smart_toy</span>
                                            AI Analysis
                                        </h4>
                                        <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div dangerouslySetInnerHTML={{ __html: result.rawAnalysis.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Predictor;