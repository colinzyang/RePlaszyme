export interface Enzyme {
    id: string;
    accession: string;
    name: string;
    ecNumber: string;
    organism: string;
    taxonomy: string;
    plasticType: PlasticType[];
    length: number;
    weight: string; // kDa
    temperature: string; // Optimal Temp
    ph: string; // Optimal pH
    pdbId?: string;
    sequence: string;
    reference: string;
    structureUrl?: string;  // S3 URL for custom structures
}

export enum PlasticType {
    PET = 'PET',
    PE = 'PE',
    PP = 'PP',
    PS = 'PS',
    PUR = 'PUR',
    PLA = 'PLA',
    PHB = 'PHB'
}

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