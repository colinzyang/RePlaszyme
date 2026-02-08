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
        <section className="glass-panel rounded-3xl p-6 md:p-8">
            <h2 className="text-xl font-light text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined">history</span>
                Database Updates
            </h2>
            <div className="relative border-l border-slate-200 ml-3 space-y-8">
                {TIMELINE_EVENTS.map((event) => (
                    <div key={event.id} className="relative pl-8 group">
                        <span className={`absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full border border-white shadow-sm ring-4 ring-white ${event.category === 'New Data' ? 'bg-emerald-500' : 'bg-accent'}`}></span>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-mono text-slate-400">{event.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border w-fit ${getCategoryColor(event.category)}`}>
                                {event.category}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-primary group-hover:text-accent transition-colors cursor-pointer">{event.title}</h3>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Timeline;
