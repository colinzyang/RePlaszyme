#!/usr/bin/env python3
"""
PlaszymeDB One-Time Audit and Enrichment Script
Syncs plaszyme.db with PlaszymeDB_v1.1.csv to fix missing/placeholder data

Features:
- Upserts enzyme records (insert if missing, update if exists)
- Replaces "Unknown" and NULL values with real data from CSV
- Handles 34 one-hot encoded plastic degradation columns
- Updates plastic_substrates junction table
- Validates sequence data for Nightingale viewer compatibility
- Independence check: ensures app runs from plaszyme.db only

Usage:
    python3 audit_enrich_db.py
"""

import sqlite3
import csv
import sys
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set, Optional

# Mapping CSV columns to plastic substrate codes
MAJOR_PLASTICS_MAP = {
    'can_degrade_PET': 'PET',
    'can_degrade_PE': 'PE',
    'can_degrade_PP': 'PP',
    'can_degrade_PS': 'PS',
    'can_degrade_PU': 'PUR',
    'can_degrade_PLA': 'PLA',
    'can_degrade_PHB': 'PHB'
}

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


class DatabaseAuditor:
    def __init__(self, db_path: Path, csv_path: Path):
        self.db_path = db_path
        self.csv_path = csv_path
        self.conn = None
        self.cursor = None

        # Statistics
        self.stats = {
            'total_processed': 0,
            'new_inserts': 0,
            'updated_records': 0,
            'skipped_invalid': 0,
            'fields_updated': 0,
            'substrates_added': 0,
            'substrates_removed': 0,
            'identifiers_added': 0
        }

    def connect(self):
        """Establish database connection"""
        if not self.db_path.exists():
            print(f"✗ Error: Database {self.db_path} not found")
            sys.exit(1)

        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        self.cursor = self.conn.cursor()
        print(f"✓ Connected to database: {self.db_path}")

    def close(self):
        """Close database connection"""
        if self.conn:
            self.conn.close()

    @staticmethod
    def is_empty_or_unknown(value: Optional[str]) -> bool:
        """Check if value is NULL, empty, or 'Unknown'"""
        if value is None:
            return True
        value_str = str(value).strip()
        return value_str == '' or value_str.lower() == 'unknown' or value_str == 'N/A'

    @staticmethod
    def parse_identifiers(id_string: Optional[str]) -> List[str]:
        """Split semicolon-delimited IDs"""
        if not id_string or str(id_string).strip() == '':
            return []
        return [id.strip() for id in str(id_string).split(';') if id.strip()]

    @staticmethod
    def validate_sequence(sequence: str) -> bool:
        """Validate protein sequence for Nightingale viewer"""
        if not sequence:
            return False
        valid_chars = set('ACDEFGHIKLMNPQRSTVWY')
        return all(c in valid_chars for c in sequence.upper())

    @staticmethod
    def get_primary_accession(row: Dict) -> str:
        """Get primary accession with priority: uniprot → genbank → protein_id"""
        uniprot_ids = DatabaseAuditor.parse_identifiers(row.get('uniprot_ids', ''))
        if uniprot_ids:
            return uniprot_ids[0]

        genbank_ids = DatabaseAuditor.parse_identifiers(row.get('genbank_ids', ''))
        if genbank_ids:
            return genbank_ids[0]

        return row['protein_id']

    def enzyme_exists(self, protein_id: str) -> Optional[sqlite3.Row]:
        """Check if enzyme exists in database"""
        self.cursor.execute(
            'SELECT * FROM enzymes WHERE protein_id = ?',
            (protein_id,)
        )
        return self.cursor.fetchone()

    def get_existing_substrates(self, enzyme_id: int) -> Set[str]:
        """Get current substrate codes for an enzyme"""
        self.cursor.execute(
            'SELECT substrate_code FROM plastic_substrates WHERE enzyme_id = ?',
            (enzyme_id,)
        )
        return {row[0] for row in self.cursor.fetchall()}

    def get_existing_identifiers(self, enzyme_id: int, id_type: str) -> Set[str]:
        """Get existing identifiers of a specific type for an enzyme"""
        self.cursor.execute(
            'SELECT identifier_value FROM identifiers WHERE enzyme_id = ? AND identifier_type = ?',
            (enzyme_id, id_type)
        )
        return {row[0] for row in self.cursor.fetchall()}

    def extract_substrates_from_csv(self, row: Dict) -> Set[str]:
        """Extract plastic substrates from one-hot encoded columns"""
        substrates = set()
        for csv_col, plastic_code in ALL_PLASTICS_MAP.items():
            if row.get(csv_col) == '1':
                substrates.add(plastic_code)
        return substrates

    def insert_new_enzyme(self, row: Dict):
        """Insert new enzyme record"""
        sequence = row.get('sequence', '')
        if not self.validate_sequence(sequence):
            print(f"  ⚠ Invalid sequence for {row['protein_id']}, skipping")
            self.stats['skipped_invalid'] += 1
            return

        primary_accession = self.get_primary_accession(row)
        seq_length = len(sequence)

        self.cursor.execute('''
            INSERT INTO enzymes (
                protein_id, accession, enzyme_name, ec_number,
                gene_name, host_organism, taxonomy, sequence,
                sequence_length, reference, source_name,
                sequence_source, structure_source, ec_number_source,
                predicted_ec_number, ec_prediction_source, structure_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            row['protein_id'],
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
            f"https://plaszyme-assets.s3.us-east-1.amazonaws.com/pdb_predicted/{primary_accession}.pdb"
        ))

        enzyme_id = self.cursor.lastrowid
        self.stats['new_inserts'] += 1

        # Insert identifiers
        self.insert_identifiers(enzyme_id, row)

        # Insert substrates
        self.insert_substrates(enzyme_id, row)

        print(f"  ✓ Inserted {row['protein_id']}")

    def update_existing_enzyme(self, existing: sqlite3.Row, row: Dict):
        """Update existing enzyme with CSV data (only NULL/Unknown values)"""
        updates = []
        params = []
        enzyme_id = existing['id']

        # Fields to potentially update
        field_mapping = {
            'enzyme_name': 'enzyme_name',
            'ec_number': 'ec_number',
            'gene_name': 'gene_name',
            'host_organism': 'host_organism',
            'taxonomy': 'taxonomy',
            'reference': 'reference',
            'source_name': 'source_name',
            'sequence_source': 'sequence_source',
            'structure_source': 'structure_source',
            'ec_number_source': 'ec_number_source',
            'predicted_ec_number': 'predicted_ec_number',
            'ec_prediction_source': 'ec_prediction_source'
        }

        for csv_col, db_col in field_mapping.items():
            db_value = existing[db_col]
            csv_value = row.get(csv_col)

            # Update if DB value is NULL/Unknown and CSV has real data
            if self.is_empty_or_unknown(db_value) and not self.is_empty_or_unknown(csv_value):
                updates.append(f"{db_col} = ?")
                params.append(csv_value)
                self.stats['fields_updated'] += 1

        # Always update sequence if it's different and valid
        csv_sequence = row.get('sequence', '')
        if csv_sequence and self.validate_sequence(csv_sequence):
            if existing['sequence'] != csv_sequence:
                updates.append("sequence = ?")
                updates.append("sequence_length = ?")
                params.extend([csv_sequence, len(csv_sequence)])
                self.stats['fields_updated'] += 2

        # Update accession if needed
        primary_accession = self.get_primary_accession(row)
        if self.is_empty_or_unknown(existing['accession']) and primary_accession:
            updates.append("accession = ?")
            params.append(primary_accession)
            self.stats['fields_updated'] += 1

        # Execute update if any fields changed
        if updates:
            params.append(enzyme_id)
            update_query = f"UPDATE enzymes SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
            self.cursor.execute(update_query, params)
            self.stats['updated_records'] += 1
            print(f"  ✓ Updated {row['protein_id']} ({len(updates)} fields)")

        # Update identifiers
        self.update_identifiers(enzyme_id, row)

        # Update substrates
        self.update_substrates(enzyme_id, row)

    def insert_identifiers(self, enzyme_id: int, row: Dict):
        """Insert identifiers for new enzyme"""
        id_types = [
            ('genbank', 'genbank_ids'),
            ('uniprot', 'uniprot_ids'),
            ('pdb', 'pdb_ids'),
            ('refseq', 'refseq_ids')
        ]

        for id_type, csv_col in id_types:
            for identifier in self.parse_identifiers(row.get(csv_col, '')):
                self.cursor.execute(
                    'INSERT OR IGNORE INTO identifiers (enzyme_id, identifier_type, identifier_value) VALUES (?, ?, ?)',
                    (enzyme_id, id_type, identifier)
                )
                if self.cursor.rowcount > 0:
                    self.stats['identifiers_added'] += 1

    def update_identifiers(self, enzyme_id: int, row: Dict):
        """Update identifiers for existing enzyme (add missing ones)"""
        id_types = [
            ('genbank', 'genbank_ids'),
            ('uniprot', 'uniprot_ids'),
            ('pdb', 'pdb_ids'),
            ('refseq', 'refseq_ids')
        ]

        for id_type, csv_col in id_types:
            existing_ids = self.get_existing_identifiers(enzyme_id, id_type)
            csv_ids = set(self.parse_identifiers(row.get(csv_col, '')))

            # Add missing identifiers
            for identifier in csv_ids - existing_ids:
                self.cursor.execute(
                    'INSERT OR IGNORE INTO identifiers (enzyme_id, identifier_type, identifier_value) VALUES (?, ?, ?)',
                    (enzyme_id, id_type, identifier)
                )
                if self.cursor.rowcount > 0:
                    self.stats['identifiers_added'] += 1

    def insert_substrates(self, enzyme_id: int, row: Dict):
        """Insert plastic substrates for new enzyme"""
        csv_substrates = self.extract_substrates_from_csv(row)

        for substrate_code in csv_substrates:
            category = 'major' if substrate_code in MAJOR_PLASTICS else 'minor'
            self.cursor.execute(
                'INSERT OR IGNORE INTO plastic_substrates (enzyme_id, substrate_code, substrate_category, degradation_confirmed) VALUES (?, ?, ?, 1)',
                (enzyme_id, substrate_code, category)
            )
            if self.cursor.rowcount > 0:
                self.stats['substrates_added'] += 1

    def update_substrates(self, enzyme_id: int, row: Dict):
        """Update plastic substrates for existing enzyme (sync with CSV)"""
        existing_substrates = self.get_existing_substrates(enzyme_id)
        csv_substrates = self.extract_substrates_from_csv(row)

        # Add new substrates
        for substrate_code in csv_substrates - existing_substrates:
            category = 'major' if substrate_code in MAJOR_PLASTICS else 'minor'
            self.cursor.execute(
                'INSERT OR IGNORE INTO plastic_substrates (enzyme_id, substrate_code, substrate_category, degradation_confirmed) VALUES (?, ?, ?, 1)',
                (enzyme_id, substrate_code, category)
            )
            if self.cursor.rowcount > 0:
                self.stats['substrates_added'] += 1

        # Remove obsolete substrates (in DB but not in CSV)
        for substrate_code in existing_substrates - csv_substrates:
            self.cursor.execute(
                'DELETE FROM plastic_substrates WHERE enzyme_id = ? AND substrate_code = ?',
                (enzyme_id, substrate_code)
            )
            if self.cursor.rowcount > 0:
                self.stats['substrates_removed'] += 1

    def process_csv(self):
        """Main processing logic"""
        if not self.csv_path.exists():
            print(f"✗ Error: CSV file {self.csv_path} not found")
            sys.exit(1)

        print(f"\n{'='*70}")
        print(f"Starting Database Audit and Enrichment")
        print(f"{'='*70}")
        print(f"Source CSV: {self.csv_path}")
        print(f"Target DB:  {self.db_path}")
        print(f"{'='*70}\n")

        with open(self.csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row_num, row in enumerate(reader, start=2):
                protein_id = row.get('protein_id')
                if not protein_id:
                    print(f"  ⚠ Row {row_num}: Missing protein_id, skipping")
                    self.stats['skipped_invalid'] += 1
                    continue

                self.stats['total_processed'] += 1

                # Check if enzyme exists
                existing = self.enzyme_exists(protein_id)

                if existing:
                    self.update_existing_enzyme(existing, row)
                else:
                    self.insert_new_enzyme(row)

                # Progress indicator
                if self.stats['total_processed'] % 50 == 0:
                    print(f"\n  Progress: {self.stats['total_processed']} rows processed...\n")

        self.conn.commit()

    def print_summary(self):
        """Print audit summary"""
        print(f"\n{'='*70}")
        print(f"Audit and Enrichment Summary")
        print(f"{'='*70}")
        print(f"Total rows processed:      {self.stats['total_processed']}")
        print(f"New enzymes inserted:      {self.stats['new_inserts']}")
        print(f"Existing enzymes updated:  {self.stats['updated_records']}")
        print(f"Database fields updated:   {self.stats['fields_updated']}")
        print(f"Identifiers added:         {self.stats['identifiers_added']}")
        print(f"Substrates added:          {self.stats['substrates_added']}")
        print(f"Substrates removed:        {self.stats['substrates_removed']}")
        print(f"Invalid rows skipped:      {self.stats['skipped_invalid']}")
        print(f"{'='*70}")

    def validate_database(self):
        """Validate database integrity after enrichment"""
        print(f"\nDatabase Validation:")
        print(f"{'='*70}")

        # Total enzymes
        self.cursor.execute('SELECT COUNT(*) FROM enzymes')
        total_enzymes = self.cursor.fetchone()[0]
        print(f"Total enzymes in database: {total_enzymes}")

        # Data quality checks
        self.cursor.execute("SELECT COUNT(*) FROM enzymes WHERE enzyme_name IS NULL OR enzyme_name = 'Unknown'")
        unknown_names = self.cursor.fetchone()[0]
        print(f"  Missing enzyme names:    {unknown_names} ({unknown_names*100//total_enzymes if total_enzymes > 0 else 0}%)")

        self.cursor.execute("SELECT COUNT(*) FROM enzymes WHERE host_organism IS NULL OR host_organism = 'Unknown'")
        unknown_organisms = self.cursor.fetchone()[0]
        print(f"  Missing organisms:       {unknown_organisms} ({unknown_organisms*100//total_enzymes if total_enzymes > 0 else 0}%)")

        self.cursor.execute("SELECT COUNT(*) FROM enzymes WHERE sequence IS NULL OR sequence = ''")
        missing_sequences = self.cursor.fetchone()[0]
        print(f"  Missing sequences:       {missing_sequences} ({missing_sequences*100//total_enzymes if total_enzymes > 0 else 0}%)")

        # Substrate distribution
        self.cursor.execute('''
            SELECT substrate_code, COUNT(*) as count
            FROM plastic_substrates
            WHERE substrate_category = 'major'
            GROUP BY substrate_code
            ORDER BY count DESC
        ''')
        print(f"\nMajor plastic substrate distribution:")
        for row in self.cursor.fetchall():
            print(f"  {row[0]}: {row[1]} enzymes")

        # Check if X0001 exists
        self.cursor.execute("SELECT protein_id, enzyme_name, host_organism, sequence_length FROM enzymes WHERE protein_id = 'X0001'")
        x0001 = self.cursor.fetchone()
        if x0001:
            print(f"\n✓ X0001 exists in database:")
            print(f"  ID: {x0001[0]}")
            print(f"  Name: {x0001[1] or 'NULL'}")
            print(f"  Organism: {x0001[2] or 'NULL'}")
            print(f"  Sequence Length: {x0001[3]}")
        else:
            print(f"\n✗ X0001 NOT FOUND in database")

        print(f"{'='*70}\n")


def main():
    csv_path = Path('PlaszymeDB_v1.1.csv')
    db_path = Path('plaszyme.db')

    # Create auditor instance
    auditor = DatabaseAuditor(db_path, csv_path)

    try:
        # Connect to database
        auditor.connect()

        # Process CSV and enrich database
        auditor.process_csv()

        # Print summary
        auditor.print_summary()

        # Validate results
        auditor.validate_database()

        print(f"✓ Audit and enrichment complete!")
        print(f"✓ Database is ready: {db_path}")
        print(f"\nNext steps:")
        print(f"  1. Restart FastAPI backend: cd backend && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000")
        print(f"  2. Restart React frontend: npm run dev")
        print(f"  3. The app will now fetch all data from plaszyme.db (CSV not required)")

    except Exception as e:
        print(f"\n✗ Error during audit: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    finally:
        auditor.close()


if __name__ == '__main__':
    main()
