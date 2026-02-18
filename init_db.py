#!/usr/bin/env python3
"""
PlaszymeDB SQLite Initialization Script
Parses PlaszymeDB_v1.1.csv (474 enzymes, 54 columns) and creates plaszyme.db

Usage:
    python init_db.py
"""

import sqlite3
import csv
import sys
from pathlib import Path
from datetime import datetime

# Mapping CSV columns to PlasticType enum (major plastics in TypeScript)
MAJOR_PLASTICS_MAP = {
    'can_degrade_PET': 'PET',
    'can_degrade_PE': 'PE',
    'can_degrade_PP': 'PP',  # Not in CSV but in enum
    'can_degrade_PS': 'PS',
    'can_degrade_PU': 'PUR',  # CSV uses PU, enum uses PUR
    'can_degrade_PLA': 'PLA',
    'can_degrade_PHB': 'PHB'
}

# Minor/specialty plastics
MINOR_PLASTICS_MAP = {
    'can_degrade_ECOFLEX': 'ECOFLEX',
    'can_degrade_ECOVIO_FT': 'ECOVIO_FT',
    'can_degrade_Impranil': 'Impranil',
    'can_degrade_NR': 'NR',
    'can_degrade_O_PVA': 'O_PVA',
    'can_degrade_P(3HB_co_3MP)': 'P(3HB_co_3MP)',
    'can_degrade_P3HP': 'P3HP',
    'can_degrade_P3HV': 'P3HV',
    'can_degrade_P4HB': 'P4HB',
    'can_degrade_PA': 'PA',
    'can_degrade_PBAT': 'PBAT',
    'can_degrade_PBS': 'PBS',
    'can_degrade_PBSA': 'PBSA',
    'can_degrade_PBSeT': 'PBSeT',
    'can_degrade_PCL': 'PCL',
    'can_degrade_PEA': 'PEA',
    'can_degrade_PEF': 'PEF',
    'can_degrade_PEG': 'PEG',
    'can_degrade_PES': 'PES',
    'can_degrade_PHBH': 'PHBH',
    'can_degrade_PHBV': 'PHBV',
    'can_degrade_PHBVH': 'PHBVH',
    'can_degrade_PHO': 'PHO',
    'can_degrade_PHPV': 'PHPV',
    'can_degrade_PHV': 'PHV',
    'can_degrade_PMCL': 'PMCL',
    'can_degrade_PPL': 'PPL',
    'can_degrade_PVA': 'PVA'
}

ALL_PLASTICS_MAP = {**MAJOR_PLASTICS_MAP, **MINOR_PLASTICS_MAP}
MAJOR_PLASTICS = set(MAJOR_PLASTICS_MAP.values())


def create_schema(conn):
    """Create database schema with tables and indexes"""
    cursor = conn.cursor()

    # Core enzyme table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS enzymes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            protein_id TEXT UNIQUE NOT NULL,
            plz_id TEXT,
            accession TEXT,
            enzyme_name TEXT,
            ec_number TEXT,
            gene_name TEXT,
            host_organism TEXT,
            taxonomy TEXT,
            sequence TEXT NOT NULL,
            sequence_length INTEGER,
            molecular_weight TEXT,
            optimal_temperature TEXT,
            optimal_ph TEXT,
            reference TEXT,
            source_name TEXT,
            sequence_source TEXT,
            structure_source TEXT,
            ec_number_source TEXT,
            structure_url TEXT,
            predicted_ec_number TEXT,
            ec_prediction_source TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # External identifiers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS identifiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enzyme_id INTEGER NOT NULL,
            identifier_type TEXT NOT NULL,
            identifier_value TEXT NOT NULL,
            FOREIGN KEY (enzyme_id) REFERENCES enzymes(id) ON DELETE CASCADE
        )
    ''')

    # Plastic substrates junction table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS plastic_substrates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            enzyme_id INTEGER NOT NULL,
            substrate_code TEXT NOT NULL,
            substrate_category TEXT,
            degradation_confirmed BOOLEAN DEFAULT 1,
            FOREIGN KEY (enzyme_id) REFERENCES enzymes(id) ON DELETE CASCADE,
            UNIQUE(enzyme_id, substrate_code)
        )
    ''')

    # Substrate types reference table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS substrate_types (
            code TEXT PRIMARY KEY,
            full_name TEXT NOT NULL,
            category TEXT NOT NULL,
            chemical_structure_url TEXT
        )
    ''')

    # Database metadata table (includes license information)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS db_metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create indexes for performance
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_enzymes_accession ON enzymes(accession)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_enzymes_protein_id ON enzymes(protein_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_enzymes_plz_id ON enzymes(plz_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_enzymes_organism ON enzymes(host_organism)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_identifiers_enzyme ON identifiers(enzyme_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_identifiers_type_value ON identifiers(identifier_type, identifier_value)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_substrates_enzyme ON plastic_substrates(enzyme_id)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_substrates_code ON plastic_substrates(substrate_code)')
    cursor.execute('CREATE INDEX IF NOT EXISTS idx_substrates_category ON plastic_substrates(substrate_category)')

    conn.commit()
    print("✓ Database schema created successfully")


def populate_db_metadata(conn):
    """Populate database metadata including license information"""
    from datetime import datetime

    metadata = [
        ('db_name', 'RePlaszyme'),
        ('db_version', '1.1'),
        ('db_license', 'MIT'),
        ('db_license_url', 'https://opensource.org/licenses/MIT'),
        ('data_source', 'PlaszymeDB_v1.1.csv'),
        ('created_at', datetime.now().isoformat()),
        ('total_enzymes', '474'),
        ('description', 'Comprehensive database of plastic-degrading enzymes with sequence, structure, and substrate information'),
    ]

    cursor = conn.cursor()
    cursor.executemany(
        'INSERT OR REPLACE INTO db_metadata (key, value, updated_at) VALUES (?, ?, ?)',
        [(k, v, datetime.now().isoformat()) for k, v in metadata]
    )
    conn.commit()
    print(f"✓ Populated database metadata with {len(metadata)} entries")


def populate_substrate_types(conn):
    """Populate substrate_types reference table"""
    substrates = [
        # Major plastics
        ('PET', 'Polyethylene terephthalate', 'major', None),
        ('PE', 'Polyethylene', 'major', None),
        ('PP', 'Polypropylene', 'major', None),
        ('PS', 'Polystyrene', 'major', None),
        ('PUR', 'Polyurethane', 'major', None),
        ('PLA', 'Polylactic acid', 'major', None),
        ('PHB', 'Polyhydroxybutyrate', 'major', None),
        # Minor plastics
        ('ECOFLEX', 'ECOFLEX', 'minor', None),
        ('ECOVIO_FT', 'ECOVIO FT', 'minor', None),
        ('Impranil', 'Impranil', 'minor', None),
        ('NR', 'Natural Rubber', 'minor', None),
        ('O_PVA', 'Oxidized PVA', 'minor', None),
        ('P(3HB_co_3MP)', 'P(3HB-co-3MP)', 'minor', None),
        ('P3HP', 'Poly(3-hydroxypropionate)', 'minor', None),
        ('P3HV', 'Poly(3-hydroxyvalerate)', 'minor', None),
        ('P4HB', 'Poly(4-hydroxybutyrate)', 'minor', None),
        ('PA', 'Polyamide (Nylon)', 'minor', None),
        ('PBAT', 'Polybutylene adipate terephthalate', 'minor', None),
        ('PBS', 'Polybutylene succinate', 'minor', None),
        ('PBSA', 'Polybutylene succinate adipate', 'minor', None),
        ('PBSeT', 'Polybutylene sebacate terephthalate', 'minor', None),
        ('PCL', 'Polycaprolactone', 'minor', None),
        ('PEA', 'Polyethylene adipate', 'minor', None),
        ('PEF', 'Polyethylene furanoate', 'minor', None),
        ('PEG', 'Polyethylene glycol', 'minor', None),
        ('PES', 'Polyester', 'minor', None),
        ('PHBH', 'Poly(3-hydroxybutyrate-co-3-hydroxyhexanoate)', 'minor', None),
        ('PHBV', 'Poly(3-hydroxybutyrate-co-3-hydroxyvalerate)', 'minor', None),
        ('PHBVH', 'Poly(3-hydroxybutyrate-co-3-hydroxyvalerate-co-3-hydroxyhexanoate)', 'minor', None),
        ('PHO', 'Poly(3-hydroxyoctanoate)', 'minor', None),
        ('PHPV', 'Poly(3-hydroxypropionate-co-3-hydroxyvalerate)', 'minor', None),
        ('PHV', 'Poly(3-hydroxyvalerate)', 'minor', None),
        ('PMCL', 'Poly(methyl-caprolactone)', 'minor', None),
        ('PPL', 'Polypentanolactone', 'minor', None),
        ('PVA', 'Polyvinyl alcohol', 'minor', None),
    ]

    cursor = conn.cursor()
    cursor.executemany(
        'INSERT OR IGNORE INTO substrate_types (code, full_name, category, chemical_structure_url) VALUES (?, ?, ?, ?)',
        substrates
    )
    conn.commit()
    print(f"✓ Populated {len(substrates)} substrate types")


def parse_identifiers(id_string):
    """Split semicolon-delimited IDs and return list"""
    if not id_string or id_string.strip() == '':
        return []
    return [id.strip() for id in id_string.split(';') if id.strip()]


def get_primary_accession(row):
    """Get primary accession with priority: uniprot_ids → genbank_ids → protein_id"""
    uniprot_ids = parse_identifiers(row.get('uniprot_ids', ''))
    if uniprot_ids:
        return uniprot_ids[0]

    genbank_ids = parse_identifiers(row.get('genbank_ids', ''))
    if genbank_ids:
        return genbank_ids[0]

    return row['protein_id']


def get_primary_pdb(pdb_string):
    """Extract first PDB ID for structure visualization"""
    pdb_ids = parse_identifiers(pdb_string)
    return pdb_ids[0] if pdb_ids else None


def generate_structure_url(accession):
    """Generate S3 URL for predicted structure (file may not exist yet)"""
    return f"https://plaszyme-assets.s3.us-east-1.amazonaws.com/pdb_predicted/{accession}.pdb"


def validate_sequence(sequence):
    """Basic sequence validation (amino acid alphabet)"""
    if not sequence:
        return False
    # Allow standard amino acids + ambiguous codes (B, J, O, U, X, Z)
    # These are valid IUPAC codes for ambiguous amino acids
    valid_chars = set('ACDEFGHIKLMNPQRSTVWYBJOUXZ')
    return all(c in valid_chars for c in sequence.upper())


def import_csv(csv_path, db_path):
    """Main import logic"""
    conn = sqlite3.connect(db_path)

    # Create schema and populate reference data
    create_schema(conn)
    populate_db_metadata(conn)
    populate_substrate_types(conn)

    cursor = conn.cursor()
    enzyme_count = 0
    identifier_count = 0
    substrate_count = 0
    skipped_count = 0

    print(f"\nImporting data from {csv_path}...")

    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)

        for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is line 1)
            try:
                # Validate sequence
                sequence = row['sequence']
                if not validate_sequence(sequence):
                    print(f"⚠ Warning: Invalid sequence for {row['protein_id']}, skipping")
                    skipped_count += 1
                    continue

                seq_length = len(sequence)
                primary_accession = get_primary_accession(row)

                # Insert enzyme record
                cursor.execute('''
                    INSERT INTO enzymes (
                        protein_id, plz_id, accession, enzyme_name, ec_number,
                        gene_name, host_organism, taxonomy, sequence,
                        sequence_length, reference, source_name,
                        sequence_source, structure_source, ec_number_source,
                        predicted_ec_number, ec_prediction_source, structure_url
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    row['protein_id'],
                    row.get('PLZ_ID') or None,
                    primary_accession,
                    row.get('enzyme_name') or None,
                    row.get('ec_number') or None,
                    row.get('gene_name') or None,
                    row.get('host_organism') or None,
                    row.get('taxonomy') or None,
                    sequence,
                    seq_length,
                    row.get('reference') or None,
                    row.get('source_name') or None,
                    row.get('sequence_source') or None,
                    row.get('structure_source') or None,
                    row.get('ec_number_source') or None,
                    row.get('predicted_ec_number') or None,
                    row.get('ec_prediction_source') or None,
                    generate_structure_url(primary_accession)
                ))

                enzyme_id = cursor.lastrowid
                enzyme_count += 1

                # Insert identifiers
                for id_type, csv_col in [
                    ('genbank', 'genbank_ids'),
                    ('uniprot', 'uniprot_ids'),
                    ('pdb', 'pdb_ids'),
                    ('refseq', 'refseq_ids')
                ]:
                    for identifier in parse_identifiers(row.get(csv_col, '')):
                        cursor.execute(
                            'INSERT INTO identifiers (enzyme_id, identifier_type, identifier_value) VALUES (?, ?, ?)',
                            (enzyme_id, id_type, identifier)
                        )
                        identifier_count += 1

                # Insert plastic substrates
                for csv_col, plastic_code in ALL_PLASTICS_MAP.items():
                    if row.get(csv_col) == '1':
                        category = 'major' if plastic_code in MAJOR_PLASTICS else 'minor'
                        cursor.execute(
                            'INSERT INTO plastic_substrates (enzyme_id, substrate_code, substrate_category, degradation_confirmed) VALUES (?, ?, ?, 1)',
                            (enzyme_id, plastic_code, category)
                        )
                        substrate_count += 1

                # Progress indicator
                if enzyme_count % 50 == 0:
                    print(f"  Processed {enzyme_count} enzymes...")

            except Exception as e:
                print(f"✗ Error processing row {row_num} ({row.get('protein_id', 'unknown')}): {e}")
                skipped_count += 1
                continue

    conn.commit()

    # Print summary
    print(f"\n{'='*60}")
    print(f"Import Summary:")
    print(f"{'='*60}")
    print(f"✓ Enzymes imported:      {enzyme_count}")
    print(f"✓ Identifiers created:   {identifier_count}")
    print(f"✓ Substrate links:       {substrate_count}")
    if skipped_count > 0:
        print(f"⚠ Rows skipped:          {skipped_count}")
    print(f"{'='*60}")

    # Validation queries
    print(f"\nDatabase Validation:")
    print(f"{'='*60}")

    # Check plastic type distribution
    cursor.execute('''
        SELECT substrate_code, COUNT(*) as count
        FROM plastic_substrates
        WHERE substrate_category = 'major'
        GROUP BY substrate_code
        ORDER BY count DESC
    ''')
    print(f"Major plastic type distribution:")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]} enzymes")

    # Check for missing critical data
    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE taxonomy IS NULL')
    null_taxonomy = cursor.fetchone()[0]
    print(f"\nData completeness:")
    print(f"  Missing taxonomy: {null_taxonomy} ({null_taxonomy*100//enzyme_count}%)")

    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE ec_number IS NULL AND predicted_ec_number IS NULL')
    null_ec = cursor.fetchone()[0]
    print(f"  Missing EC number: {null_ec} ({null_ec*100//enzyme_count}%)")

    print(f"{'='*60}\n")

    conn.close()
    print(f"✓ Database saved to {db_path}")


def main():
    csv_path = Path('PlaszymeDB_v1.1.csv')
    db_path = Path('plaszyme.db')

    # Check if CSV exists
    if not csv_path.exists():
        print(f"✗ Error: {csv_path} not found")
        sys.exit(1)

    # Check if database already exists
    if db_path.exists():
        print(f"⚠ Warning: {db_path} already exists")
        response = input("Delete and recreate? (y/N): ")
        if response.lower() != 'y':
            print("Aborted.")
            sys.exit(0)
        db_path.unlink()
        print(f"✓ Deleted existing database")

    # Import data
    import_csv(csv_path, db_path)
    print("\n✓ Database initialization complete!")


if __name__ == '__main__':
    main()
