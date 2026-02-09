import React from 'react';

const StatsCards: React.FC = () => {
    return (
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
            {/* Enzymes Count */}
            <div className="col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center gap-4 relative overflow-hidden border-white/50 group">
                 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-blue-600">biotech</span>
                 </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                        <span className="material-symbols-outlined">dataset</span>
                    </div>
                    <h3 className="text-primary text-sm font-medium">Total Enzymes</h3>
                </div>
                <div>
                    <p className="text-2xl font-light text-primary">1,248</p>
                    <p className="text-slate-500 text-[10px]">Curated sequences</p>
                </div>
            </div>

             {/* Plastic Types */}
             <div className="col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center gap-4 relative overflow-hidden border-white/50 group">
                 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-emerald-600">recycling</span>
                 </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                        <span className="material-symbols-outlined">category</span>
                    </div>
                    <h3 className="text-primary text-sm font-medium">Substrates</h3>
                </div>
                <div>
                    <p className="text-2xl font-light text-primary">8</p>
                    <p className="text-slate-500 text-[10px]">Types (PET, PE, PUR...)</p>
                </div>
            </div>

            {/* Structures */}
            <div className="col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center gap-4 relative overflow-hidden border-white/50 group">
                <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-amber-600">view_in_ar</span>
                 </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                        <span className="material-symbols-outlined">deployed_code</span>
                    </div>
                    <h3 className="text-primary text-sm font-medium">Structures</h3>
                </div>
                <div>
                    <p className="text-2xl font-light text-primary">342</p>
                    <p className="text-slate-500 text-[10px]">PDB & AlphaFold Models</p>
                </div>
            </div>

            {/* Organisms */}
             <div className="col-span-1 glass-panel rounded-3xl p-6 flex flex-col justify-center gap-4 relative overflow-hidden border-white/50 group">
                 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-6xl text-purple-600">bug_report</span>
                 </div>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100 text-purple-600">
                        <span className="material-symbols-outlined">pets</span>
                    </div>
                    <h3 className="text-primary text-sm font-medium">Sources</h3>
                </div>
                <div>
                    <p className="text-2xl font-light text-primary">560+</p>
                    <p className="text-slate-500 text-[10px]">Species recorded</p>
                </div>
            </div>
        </section>
    );
};

export default StatsCards;