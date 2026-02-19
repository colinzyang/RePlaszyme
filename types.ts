export interface Enzyme {
    id: string;  // Plaszyme ID (e.g., X0001, X0031)
    plaszymeId: string;  // Explicit Plaszyme ID for clarity
    plzId?: string;  // PLZ_ID hash identifier
    accession: string;  // External database accession (GenBank/UniProt)
    genbankId?: string;  // Primary GenBank ID from identifiers table
    uniprotId?: string;  // Primary UniProt ID from identifiers table
    name: string;
    ecNumber: string;
    organism: string;
    taxonomy: string;
    plasticType: PlasticType[];
    length: number;
    weight: string; // kDa
    temperature: string; // Optimal Temp
    ph: string; // Optimal pH
    pdbId?: string;  // Primary PDB ID from identifiers table
    sequence: string;
    reference: string;
    structureUrl?: string;  // S3 URL for custom structures
}

// All substrate types from database (35 total)
export type PlasticType =
    // Major plastics (7)
    | 'PET' | 'PE' | 'PP' | 'PS' | 'PUR' | 'PLA' | 'PHB'
    // Minor plastics (28)
    | 'ECOFLEX' | 'ECOVIO_FT' | 'Impranil' | 'NR' | 'O_PVA'
    | 'P(3HB_co_3MP)' | 'P3HP' | 'P3HV' | 'P4HB' | 'PA'
    | 'PBAT' | 'PBS' | 'PBSA' | 'PBSeT' | 'PCL'
    | 'PEA' | 'PEF' | 'PEG' | 'PES' | 'PHBH'
    | 'PHBV' | 'PHBVH' | 'PHO' | 'PHPV' | 'PHV'
    | 'PMCL' | 'PPL' | 'PVA';

// All substrate types as array for UI iteration
export const ALL_SUBSTRATE_TYPES: PlasticType[] = [
    'PET', 'PE', 'PP', 'PS', 'PUR', 'PLA', 'PHB',
    'ECOFLEX', 'ECOVIO_FT', 'Impranil', 'NR', 'O_PVA',
    'P(3HB_co_3MP)', 'P3HP', 'P3HV', 'P4HB', 'PA',
    'PBAT', 'PBS', 'PBSA', 'PBSeT', 'PCL',
    'PEA', 'PEF', 'PEG', 'PES', 'PHBH',
    'PHBV', 'PHBVH', 'PHO', 'PHPV', 'PHV',
    'PMCL', 'PPL', 'PVA'
];

// Major substrate types for primary display
export const MAJOR_SUBSTRATE_TYPES: PlasticType[] = [
    'PET', 'PE', 'PP', 'PS', 'PUR', 'PLA', 'PHB'
];

export interface AnalysisResult {
    summary: string;
    likelyEnzymeType?: string;
    substrateSpecificity?: string;
}

export interface TimelineEvent {
    id: number;
    date: string;
    title: string;
    category: 'Update' | 'New Data' | 'Maintenance';
}

export type StructureSource = 'pdb' | 's3' | 'alphafold';

// BLAST API Types
export interface BlastRequest {
    sequence: string;
    max_results?: number;
    similarity_threshold?: string;
    plastic_types?: string[];
    require_structure?: boolean;
}

export interface BlastHit {
    plaszyme_id: string;
    accession: string;
    description: string;
    organism: string;
    plastic_types: string[];
    max_score: number;
    query_cover: number;
    e_value: number;
    percent_identity: number;
    alignment_length: number;
    has_structure: boolean;
}

export interface BlastQueryInfo {
    length: number;
    sequence_preview: string;
}

export interface BlastResponse {
    results: BlastHit[];
    total: number;
    filtered: number;
    query_info: BlastQueryInfo;
    execution_time_ms: number;
}