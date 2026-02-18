import { Enzyme, TimelineEvent } from './types';

export const TEXTURE_URL = "https://www.transparenttextures.com/patterns/cubes.png";

// Note: PLASZYME_DATA is deprecated - data now comes from backend API
export const PLASZYME_DATA: Enzyme[] = [
    {
        id: "enz_001",
        plaszymeId: "enz_001",
        accession: "A0A0K8P6T7",
        name: "IsPETase",
        ecNumber: "3.1.1.101",
        organism: "Ideonella sakaiensis",
        taxonomy: "Bacteria; Proteobacteria; Betaproteobacteria; Burkholderiales",
        plasticType: ['PET'],
        length: 290,
        weight: "31.5",
        temperature: "30-40°C",
        ph: "7.0-9.0",
        pdbId: "5XJH",
        sequence: "MNFPRASRLMQAAVLGGLMAVSAAATAQTNPYARGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCS",
        reference: "Yoshida et al., Science 2016"
    },
    {
        id: "enz_002",
        plaszymeId: "enz_002",
        accession: "A0A1F5",
        name: "LCC (Leaf-branch compost cutinase)",
        ecNumber: "3.1.1.74",
        organism: "Uncultured bacterium",
        taxonomy: "Bacteria; Environmental samples",
        plasticType: ['PET', 'PLA'],
        length: 293,
        weight: "32.1",
        temperature: "50-70°C",
        ph: "8.0-9.5",
        pdbId: "4EB0",
        sequence: "MASPQLPQLVVLALSALALGAQALTNPFARGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCS",
        reference: "Sulaiman et al., Appl Environ Microbiol 2012"
    },
    {
        id: "enz_003",
        plaszymeId: "enz_003",
        accession: "Q9Z4P9",
        name: "TfCut2",
        ecNumber: "3.1.1.74",
        organism: "Thermobifida fusca",
        taxonomy: "Bacteria; Actinobacteria; Actinomycetales",
        plasticType: ['PET'],
        length: 262,
        weight: "28.5",
        temperature: "50-60°C",
        ph: "6.0-8.0",
        pdbId: "4CG1",
        sequence: "MRGSHHHHHHGSVRTNPYARGPNPTAASLEASAGPFTVRSFTVSRPSGYGAGTVYYPTNAGGTVGAIAIVPGYTARQSSIKWWGPRLASHGFVVITIDTNSTLDQPSSRSSQQMAALRQVASLNGTSSSPIYGKVDTARMGVMGWSMGGGGSLISAANNPSLKAAAPQAPWDSSTNFSSVTVPTLIFACENDSIAPVNSSALPIYDSMSRNAKQFLEINGGSHSCANSGNSNQALIGKKGVAWMKRFMDNDTRYSTFACENPNSTRVSDFRTANCS",
        reference: "Roth et al., 2014"
    },
    {
        id: "enz_004",
        plaszymeId: "enz_004",
        accession: "P12345",
        name: "PUE-1",
        ecNumber: "3.5.1.-",
        organism: "Pseudomonas chlororaphis",
        taxonomy: "Bacteria; Proteobacteria; Gammaproteobacteria",
        plasticType: ['PUR'],
        length: 450,
        weight: "48.2",
        temperature: "30°C",
        ph: "7.5",
        sequence: "MKTKL...",
        reference: "Howard et al., 2001"
    },
    {
        id: "enz_005",
        plaszymeId: "enz_005",
        accession: "G5G6H7",
        name: "Alk B2",
        ecNumber: "1.14.15.3",
        organism: "Pseudomonas putida",
        taxonomy: "Bacteria; Proteobacteria; Gammaproteobacteria",
        plasticType: ['PE', 'PP'],
        length: 405,
        weight: "45.0",
        temperature: "25-35°C",
        ph: "7.0",
        pdbId: "1T92",
        sequence: "MSV...",
        reference: "van Beilen et al., 2005"
    }
];

export const TIMELINE_EVENTS: TimelineEvent[] = [
    {
        id: 1,
        date: "2026-02-19",
        title: "RePlaszyme v1.1 database initialized with 474 curated enzymes",
        category: "New Data"
    },
    {
        id: 2,
        date: "2026-02-19",
        title: "Integrated 34 plastic substrate types (major & minor polymers)",
        category: "Update"
    },
    {
        id: 3,
        date: "2026-02-19",
        title: "Added 474 AlphaFold predicted 3D structures",
        category: "New Data"
    },
    {
        id: 4,
        date: "2026-02-19",
        title: "Collected enzymes from 214+ microbial species",
        category: "Update"
    },
];