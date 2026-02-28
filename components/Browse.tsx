import React, { useState, useEffect } from 'react';
import { getEnzymes, exportAllEnzymes } from '@/services/api/databaseService';
import { Enzyme, PlasticType, ALL_SUBSTRATE_TYPES } from '../types';

interface BrowseProps {
    onSelectEnzyme: (enzyme: Enzyme) => void;
    initialSearchTerm?: string;
}

const Browse: React.FC<BrowseProps> = ({ onSelectEnzyme, initialSearchTerm }) => {
    // State for async data
    const [enzymes, setEnzymes] = useState<Enzyme[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filter and UI state
    const [selectedPlastics, setSelectedPlastics] = useState<PlasticType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // UI State for filter accordion - Default expanded
    const [isFilterExpanded, setIsFilterExpanded] = useState(true);

    // Export state
    const [isExporting, setIsExporting] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Sync initialSearchTerm from parent (e.g., Hero search)
    useEffect(() => {
        if (initialSearchTerm !== undefined && initialSearchTerm !== searchTerm) {
            setSearchTerm(initialSearchTerm);
            setCurrentPage(1);
        }
    }, [initialSearchTerm]);

    // Fetch data when filters, search, or pagination changes
    useEffect(() => {
        const fetchEnzymes = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const result = await getEnzymes({
                    searchTerm,
                    plasticTypes: selectedPlastics,
                    page: currentPage,
                    limit: itemsPerPage
                });

                setEnzymes(result.data);
                setTotalCount(result.total);
            } catch (err) {
                console.error('Failed to fetch enzymes:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load enzymes. Please ensure the backend API is running.';
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEnzymes();
    }, [searchTerm, selectedPlastics, currentPage, itemsPerPage]);

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
        if (selectedIds.size === enzymes.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(enzymes.map(e => e.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    // Calculate total pages from server total
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    const handlePageChange = (pageNumber: number) => {
        if (pageNumber >= 1 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
        }
    };

    const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const exportData = async () => {
        setIsExporting(true);
        setExportMessage(null);

        try {
            // Fetch ALL data matching current filters (not just current page)
            const allData = await exportAllEnzymes({
                searchTerm,
                plasticTypes: selectedPlastics
            });

            // Filter by selected IDs if any are selected
            const dataToExport = selectedIds.size > 0
                ? allData.filter(e => selectedIds.has(e.id))
                : allData;

            if (dataToExport.length === 0) {
                setExportMessage({ type: 'error', text: 'No data to export. Please adjust your filters or selection.' });
                return;
            }

            // Helper to escape CSV fields (wrap in quotes if contains comma, quote, or newline)
            const escapeCSV = (value: string | undefined | null): string => {
                if (value === undefined || value === null || value === '') return 'N/A';
                const str = String(value);
                if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };

            // Extended CSV headers with all available fields
            const csvHeaders = [
                "Plaszyme ID", "PLZ ID", "Accession", "Gene Name",
                "Name", "Organism", "Taxonomy",
                "EC Number", "Predicted EC Number",
                "Plastic Types", "Sequence Length", "Weight (kDa)",
                "Temperature", "pH",
                "GenBank ID", "UniProt ID", "RefSeq ID", "PDB ID",
                "Reference", "Source Name", "Sequence Source", "Structure Source",
                "EC Number Source", "EC Prediction Source",
                "Sequence"
            ].join(",");

            const csvRows = dataToExport.map(e => [
                e.plaszymeId,
                escapeCSV(e.plzId),
                escapeCSV(e.accession),
                escapeCSV(e.geneName),
                escapeCSV(e.name),
                escapeCSV(e.organism),
                escapeCSV(e.taxonomy),
                escapeCSV(e.ecNumber),
                escapeCSV(e.predictedEcNumber),
                escapeCSV(e.plasticType.join(';')),
                e.length?.toString() || 'N/A',
                escapeCSV(e.weight),
                escapeCSV(e.temperature),
                escapeCSV(e.ph),
                escapeCSV(e.genbankId),
                escapeCSV(e.uniprotId),
                escapeCSV(e.refseqId),
                escapeCSV(e.pdbId),
                escapeCSV(e.reference),
                escapeCSV(e.sourceName),
                escapeCSV(e.sequenceSource),
                escapeCSV(e.structureSource),
                escapeCSV(e.ecNumberSource),
                escapeCSV(e.ecPredictionSource),
                escapeCSV(e.sequence)
            ].join(","));

            const csvContent = "data:text/csv;charset=utf-8," + csvHeaders + "\n" + csvRows.join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.setAttribute('href', encodedUri);
            link.setAttribute('download', `plaszyme_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setExportMessage({ type: 'success', text: `Successfully exported ${dataToExport.length} enzyme${dataToExport.length > 1 ? 's' : ''}.` });

            // Clear success message after 3 seconds
            setTimeout(() => setExportMessage(null), 3000);
        } catch (error) {
            console.error('Failed to export data:', error);
            const errorMsg = error instanceof Error
                ? error.message
                : 'Unknown error occurred';
            setExportMessage({
                type: 'error',
                text: `Export failed: ${errorMsg}. Please ensure the backend API is running.`
            });
        } finally {
            setIsExporting(false);
        }
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
        <div className="w-full mx-auto animate-fade-in-up pb-12">
            <div className="glass-panel rounded-3xl p-6 md:p-8 relative overflow-hidden min-h-[600px]">
                
                {/* Standardized Header */}
                <header className="mb-8 border-b border-slate-200 pb-6">
                    <div className="flex items-center gap-2 mb-1 text-accent">
                        <span className="material-symbols-outlined text-lg">dataset</span>
                        <span className="text-[10px] font-bold tracking-wider uppercase">Database Access</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-light text-primary">Enzyme Browser</h1>
                            <p className="text-slate-500 text-xs mt-2 max-w-2xl">
                                Filter, search, and explore the comprehensive catalog of plastic-degrading enzymes.
                            </p>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Sidebar Filters - Inner Panel Style */}
                    <aside className="w-full lg:w-64 bg-slate-50/50 border border-slate-200 rounded-xl p-5 flex-shrink-0 sticky top-4">
                        <div>
                            <button 
                                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                                className="w-full flex items-center justify-between text-xs font-semibold text-primary group outline-none select-none"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base text-slate-400 group-hover:text-accent transition-colors">filter_alt</span> 
                                    <span>Substrate Filter</span>
                                </div>
                                <span className={`material-symbols-outlined text-slate-400 text-base transition-transform duration-300 ${isFilterExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFilterExpanded ? 'max-h-[800px] opacity-100 pt-4' : 'max-h-0 opacity-0'}`}>
                                <div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto pr-2">
                                    {ALL_SUBSTRATE_TYPES.map((type) => (
                                        <label key={type} className="flex items-center gap-2 cursor-pointer group py-1">
                                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${selectedPlastics.includes(type) ? 'bg-accent border-accent' : 'border-slate-300 bg-white'}`}>
                                                {selectedPlastics.includes(type) && <span className="material-symbols-outlined text-[10px] text-white">check</span>}
                                            </div>
                                            <input type="checkbox" className="hidden" onChange={() => togglePlastic(type)} checked={selectedPlastics.includes(type)} />
                                            <span className="text-xs text-slate-600 group-hover:text-primary">{type}</span>
                                        </label>
                                    ))}
                                </div>
                                
                                <button onClick={() => {setSelectedPlastics([]); setSearchTerm(''); setCurrentPage(1);}} className="w-full py-2 text-[10px] text-slate-500 hover:text-accent border border-dashed border-slate-300 rounded-lg hover:border-accent transition-colors">
                                    Reset All Filters
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1 w-full flex flex-col gap-4">
                        
                        {/* Search Bar - Inner Panel Style */}
                        <div className="bg-white border border-slate-200 rounded-xl p-1.5 flex items-center shadow-sm focus-within:shadow-md focus-within:border-accent/50 transition-all">
                            <span className="material-symbols-outlined text-slate-400 ml-3 text-lg">search</span>
                            <input 
                                type="text" 
                                placeholder="Search enzymes by Name, Accession, or Organism..." 
                                className="w-full bg-transparent border-none outline-none text-xs text-primary placeholder-slate-400 h-9 px-3 focus:ring-0"
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => {setSearchTerm(''); setCurrentPage(1);}} 
                                    className="mr-2 text-slate-400 hover:text-slate-600"
                                >
                                    <span className="material-symbols-outlined text-base">close</span>
                                </button>
                            )}
                        </div>

                        {/* Top Control Bar - Inner Panel Style */}
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-[10px] text-slate-500">
                                Showing <span className="font-semibold text-primary">{totalCount > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to <span className="font-semibold text-primary">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-semibold text-primary">{totalCount}</span> enzymes
                            </div>
                            <div className="flex gap-3 items-center w-full sm:w-auto">
                                <div className="flex items-center gap-2">
                                    <label className="text-[10px] text-slate-400 font-medium whitespace-nowrap">Rows:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={handleLimitChange}
                                        className="bg-white border border-slate-200 text-slate-600 text-[10px] rounded-lg focus:ring-accent focus:border-accent block w-14 p-1 outline-none cursor-pointer"
                                    >
                                        <option value={10}>10</option>
                                        <option value={30}>30</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                </div>
                                <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
                                <button
                                    onClick={exportData}
                                    disabled={isExporting}
                                    className={`px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-600 hover:bg-slate-50 hover:text-accent hover:border-accent transition-colors flex items-center gap-1.5 ml-auto sm:ml-0 ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {isExporting ? (
                                        <>
                                            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                                            Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-sm">download</span> Export CSV
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Export Message */}
                        {exportMessage && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-medium ${exportMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                <span className="material-symbols-outlined text-sm">{exportMessage.type === 'success' ? 'check_circle' : 'error'}</span>
                                {exportMessage.text}
                            </div>
                        )}

                        {/* Table - Inner Panel Style */}
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden min-h-[500px] flex flex-col shadow-sm">
                            <div className="w-full">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 text-[10px] border-b border-slate-200 uppercase tracking-wider font-bold">
                                            <th className="pl-4 pr-2 py-3 w-10">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-slate-300 text-accent focus:ring-accent"
                                                    onChange={toggleSelectAll}
                                                    checked={enzymes.length > 0 && selectedIds.size === enzymes.length}
                                                />
                                            </th>
                                            <th className="px-2 py-3 whitespace-nowrap">Plaszyme ID</th>
                                            <th className="px-2 py-3">Name</th>
                                            <th className="px-2 py-3">Organism</th>
                                            <th className="px-2 py-3">Substrate</th>
                                            <th className="pl-2 pr-4 py-3 text-right whitespace-nowrap">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                                                        <p className="text-sm text-slate-500">Loading enzymes...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-3 max-w-lg mx-auto">
                                                        <span className="material-symbols-outlined text-3xl text-red-400">error</span>
                                                        <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : enzymes.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-slate-400 text-sm">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-3xl opacity-20">search_off</span>
                                                        <span>No enzymes found. Try adjusting your filters.</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            enzymes.map(enzyme => (
                                                <tr key={enzyme.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="pl-4 pr-2 py-3">
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-slate-300 text-accent focus:ring-accent"
                                                            checked={selectedIds.has(enzyme.id)}
                                                            onChange={() => toggleSelectOne(enzyme.id)}
                                                        />
                                                    </td>
                                                    <td className="px-2 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">{enzyme.plaszymeId}</td>
                                                    <td className="px-2 py-3 text-xs font-medium text-primary break-words max-w-[12rem] lg:max-w-xs">{enzyme.name}</td>
                                                    <td className="px-2 py-3 text-xs text-slate-600 italic break-words max-w-[10rem] lg:max-w-xs">{enzyme.organism}</td>
                                                    <td className="px-2 py-3">
                                                        <div className="flex gap-1 flex-wrap">
                                                            {enzyme.plasticType.length > 0 ? (
                                                                enzyme.plasticType.map(pt => (
                                                                    <span key={pt} className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold whitespace-nowrap">
                                                                        {pt}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 italic">Not specified</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="pl-2 pr-4 py-3 text-right whitespace-nowrap">
                                                        <button
                                                            onClick={() => onSelectEnzyme(enzyme)}
                                                            className="px-3 py-1 rounded-full bg-white border border-accent/20 text-accent text-[10px] font-medium hover:bg-accent hover:text-white transition-all shadow-sm"
                                                        >
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination Footer */}
                            {totalCount > 0 && (
                                <div className="border-t border-slate-200 p-3 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
                                    <div className="text-[10px] text-slate-400">
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
                                                    className={`w-7 h-7 flex items-center justify-center rounded-lg text-[10px] font-medium transition-all ${
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
            </div>
        </div>
    );
};

export default Browse;