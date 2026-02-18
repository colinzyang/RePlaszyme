import React from 'react';
import { TIMELINE_EVENTS } from '../constants';
import { TimelineEvent } from '../types';

const getCategoryColor = (cat: string) => {
    switch (cat) {
        case 'Update': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'New Data': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
}

const Timeline: React.FC = () => {
    return (
        <section className="glass-panel rounded-3xl p-6 md:p-10 relative overflow-hidden group/section">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-slate-300/40 to-transparent" />
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50/20 to-transparent pointer-events-none" />

            {/* Standardized Header */}
            <header className="relative mb-8 border-b border-slate-200 pb-6">
                <div className="flex items-center gap-2 mb-1 text-accent">
                    <span className="material-symbols-outlined text-lg">history</span>
                    <span className="text-[10px] font-bold tracking-wider uppercase">Project History</span>
                </div>
                <h1 className="text-2xl font-light text-primary">Database Updates</h1>
                <p className="text-slate-500 text-xs mt-2 max-w-2xl">
                    Track the evolution of PlaszymeDB, including new enzyme additions, structural updates, and platform maintenance.
                </p>
            </header>

            {/* Inner Panel Style */}
            <div className="relative bg-white rounded-xl border border-slate-200 shadow-sm p-6 md:p-8 overflow-hidden">
                {/* Subtle inner highlight */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
                <div className="relative border-l border-slate-200 ml-3 space-y-10">
                    {TIMELINE_EVENTS.map((event) => (
                        <div key={event.id} className="relative pl-8 group">
                            <span className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-4 ring-white ${event.category === 'New Data' ? 'bg-emerald-500' : 'bg-accent'}`}></span>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                                <span className="text-[10px] font-mono text-slate-400 font-medium">{event.date}</span>
                                <span className={`px-2 py-0.5 rounded-[4px] text-[10px] uppercase font-bold tracking-wider border w-fit ${getCategoryColor(event.category)}`}>
                                    {event.category}
                                </span>
                            </div>
                            <h3 className="text-sm font-medium text-primary group-hover:text-accent transition-colors cursor-pointer">{event.title}</h3>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Timeline;