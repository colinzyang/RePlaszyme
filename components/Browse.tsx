import React, { useState, useMemo } from 'react';
import { PLASZYME_DATA } from '../constants';
import { Enzyme, PlasticType } from '../types';

interface BrowseProps {
    onSelectEnzyme: (enzyme: Enzyme) => void;
}

const Browse: React.FC<BrowseProps> = ({ onSelectEnzyme }) => {
    const [selectedPlastics, setSelectedPlastics] = useState<PlasticType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Generate extended dummy data for demonstration purposes to show pagination
    const allEnzymes = useMemo(() => {
        const baseData = [...PLASZYME_DATA];
        let extended = [...baseData];
        // Multiply data to simulate a database with ~105 items
        for (let i = 1; i <= 20; i++) {
            extended = [
                ...extended,
                ...baseData.map(item => ({
                    ...item,
                    id: `${item.id}_copy_${i}`,
                    accession: `${item.accession}-${i}`,
                    name: `${item.name} (Variant ${i})`
                }))
            ];
        }
        return extended;
    }, []);

    const togglePlastic = (type: PlasticType) => {
        if (selectedPlastics.includes(type)) {
            setSelectedPlastics(selectedPlastics.filter(t => t !== type));
        } else {
            setSelectedPlastics([...selectedPlastics, type]);
        }
        setCurrentPage(1); // Reset to first page on filter change
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === currentItems.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(currentItems.map(e => e.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Filter Logic
    const filteredData = allEnzymes.filter(enzyme => {
        const matchesSearch = enzyme.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              enzyme.organism.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              enzyme.accession.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesPlastic = selectedPlastics.length === 0 || enzyme.plasticType.some(pt => selectedPlastics.includes(pt));
        return matchesSearch && matchesPlastic;
    });

    // Pagination Logic
    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            // Optional: scroll to top of table
            // window.scrollTo({ top: 0, behavior: 'smooth' }); 
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const exportData = () => {
        const dataToExport = filteredData.filter(e => selectedIds.size === 0 || selectedIds.has(e.id));
        const csvContent = "data:text/csv;charset=utf-8," 
            + "ID,Name,Organism,EC Number,Plastic Types\n"
            + dataToExport.map(e => `${e.accession},${e.name},${e.organism},${e.ecNumber},"${e.plasticType.join(';')}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    };

    // Generate page numbers for pagination UI
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-fade-in-up">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 glass-panel rounded-2xl p-5 flex-shrink-0 sticky top-24">
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">filter_alt</span> Substrate Filter
                    </h3>
                    <div className="space-y-2">
                        {Object.values(PlasticType).map((type) => (
                            <label key={type} className="flex items-center gap-2 cursor-pointer group">
                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedPlastics.includes(type) ? 'bg-accent border-accent' : 'border-slate-300 bg-white'}`}>
                                    {selectedPlastics.includes(type) && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                                </div>
                                <input type="checkbox" className="hidden" onChange={() => togglePlastic(type)} checked={selectedPlastics.includes(type)} />
                                <span className="text-sm text-slate-600 group-hover:text-primary">{type}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button onClick={() => {setSelectedPlastics([]); setSearchTerm(''); setCurrentPage(1);}} className="w-full py-2 text-xs text-slate-500 hover:text-accent border border-dashed border-slate-300 rounded-lg hover:border-accent transition-colors">
                    Reset All Filters
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 w-full flex flex-col gap-4">
                
                {/* Search Bar */}
                <div className="glass-panel rounded-2xl p-1.5 flex items-center shadow-sm focus-within:shadow-md focus-within:border-accent/50 transition-all border border-white/60">
                    <span className="material-symbols-outlined text-slate-400 ml-3 text-xl">search</span>
                    <input 
                        type="text" 
                        placeholder="Search enzymes by Name, Accession, or Organism..." 
                        className="w-full bg-transparent border-none outline-none text-sm text-primary placeholder-slate-400 h-10 px-3 focus:ring-0"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => {setSearchTerm(''); setCurrentPage(1);}} 
                            className="mr-2 text-slate-400 hover:text-slate-600"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>

                {/* Top Control Bar */}
                <div className="glass-panel rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-semibold text-primary">{totalItems > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-semibold text-primary">{Math.min(indexOfLastItem, totalItems)}</span> of <span className="font-semibold text-primary">{totalItems}</span> enzymes
                    </div>
                    <div className="flex gap-3 items-center w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <label className="text-xs text-slate-400 font-medium whitespace-nowrap">Rows:</label>
                            <select 
                                value={itemsPerPage} 
                                onChange={handleLimitChange}
                                className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-accent focus:border-accent block w-16 p-1.5 outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                        <button 
                            onClick={exportData}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-accent hover:border-accent transition-colors flex items-center gap-1.5 ml-auto sm:ml-0"
                        >
                            <span className="material-symbols-outlined text-sm">download</span> Export CSV
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 min-h-[500px] flex flex-col">
                    <div className="overflow-x-auto flex-grow">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-500 text-xs border-b border-slate-200 uppercase tracking-wider font-medium">
                                    <th className="px-4 py-3 w-10">
                                        <input 
                                            type="checkbox" 
                                            className="rounded border-slate-300 text-accent focus:ring-accent" 
                                            onChange={toggleSelectAll} 
                                            checked={currentItems.length > 0 && selectedIds.size === currentItems.length} 
                                        />
                                    </th>
                                    <th className="px-4 py-3 font-semibold">Accession</th>
                                    <th className="px-4 py-3 font-semibold">Name</th>
                                    <th className="px-4 py-3 font-semibold">Organism</th>
                                    <th className="px-4 py-3 font-semibold">Substrate</th>
                                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-100">
                                {currentItems.map(enzyme => (
                                    <tr key={enzyme.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-4 py-3">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-slate-300 text-accent focus:ring-accent"
                                                checked={selectedIds.has(enzyme.id)}
                                                onChange={() => toggleSelectOne(enzyme.id)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{enzyme.accession}</td>
                                        <td className="px-4 py-3 font-medium text-primary">{enzyme.name}</td>
                                        <td className="px-4 py-3 text-slate-600 italic">{enzyme.organism}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1 flex-wrap">
                                                {enzyme.plasticType.map(pt => (
                                                    <span key={pt} className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 font-medium">
                                                        {pt}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button 
                                                onClick={() => onSelectEnzyme(enzyme)}
                                                className="px-3 py-1 rounded-full bg-white border border-accent/20 text-accent text-xs font-medium hover:bg-accent hover:text-white transition-all shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="material-symbols-outlined text-3xl opacity-20">search_off</span>
                                                <p>No enzymes found matching your filters.</p>
                                                <button 
                                                    onClick={() => {setSelectedPlastics([]); setSearchTerm('');}} 
                                                    className="text-accent hover:underline mt-1"
                                                >
                                                    Clear all filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalItems > 0 && (
                        <div className="border-t border-slate-200 p-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/30 backdrop-blur-sm">
                            <div className="text-xs text-slate-400">
                                Page {currentPage} of {totalPages}
                            </div>
                            
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                    title="First Page"
                                >
                                    <span className="material-symbols-outlined text-sm">first_page</span>
                                </button>
                                <button 
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                    title="Previous Page"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_left</span>
                                </button>
                                
                                <div className="flex items-center gap-1 mx-2">
                                    {getPageNumbers().map(page => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-all ${
                                                currentPage === page 
                                                ? 'bg-accent text-white shadow-md shadow-accent/20' 
                                                : 'bg-white border border-slate-200 text-slate-600 hover:border-accent hover:text-accent'
                                            }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button 
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                    title="Next Page"
                                >
                                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                                </button>
                                <button 
                                    onClick={() => handlePageChange(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-transparent transition-all"
                                    title="Last Page"
                                >
                                    <span className="material-symbols-outlined text-sm">last_page</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Browse;