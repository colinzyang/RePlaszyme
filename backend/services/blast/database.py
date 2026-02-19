"""
Sequence Database Module
Loads and manages enzyme sequences from SQLite database for BLAST alignment
"""

import sqlite3
from pathlib import Path
from typing import List, Dict, Optional, Set
from dataclasses import dataclass


@dataclass
class EnzymeSequence:
    """Represents an enzyme sequence with metadata"""
    id: int  # Database internal ID
    plaszyme_id: str  # Protein ID (e.g., X0001)
    accession: str  # External accession
    enzyme_name: str
    organism: str
    sequence: str
    plastic_types: List[str]
    has_structure: bool


class SequenceDatabase:
    """
    Manages loading and caching of enzyme sequences from SQLite database
    """

    def __init__(self, db_path: Optional[Path] = None):
        if db_path is None:
            db_path = Path(__file__).parent.parent.parent / "plaszyme.db"
        self.db_path = db_path
        self._sequences: Optional[List[EnzymeSequence]] = None
        self._total_sequences: int = 0
        self._avg_sequence_length: float = 0.0

    def _get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def load_sequences(
        self,
        plastic_types: Optional[List[str]] = None,
        require_structure: bool = False
    ) -> List[EnzymeSequence]:
        """
        Load enzyme sequences from database with optional filtering

        Args:
            plastic_types: Filter by plastic substrate types
            require_structure: Only include enzymes with known structures

        Returns:
            List of EnzymeSequence objects
        """
        conn = self._get_connection()
        cursor = conn.cursor()

        # Build query with filters
        base_query = '''
            SELECT DISTINCT e.id, e.protein_id, e.accession, e.enzyme_name,
                   e.host_organism, e.sequence, e.structure_url
            FROM enzymes e
        '''

        conditions = []
        params = []

        # Filter by plastic types
        if plastic_types:
            placeholders = ','.join(['?'] * len(plastic_types))
            base_query += f'''
                INNER JOIN plastic_substrates ps ON e.id = ps.enzyme_id
            '''
            conditions.append(f'ps.substrate_code IN ({placeholders})')
            params.extend(plastic_types)

        # Filter by structure availability
        if require_structure:
            conditions.append('e.structure_url IS NOT NULL')

        if conditions:
            base_query += ' WHERE ' + ' AND '.join(conditions)

        cursor.execute(base_query, params)
        rows = cursor.fetchall()

        sequences = []
        for row in rows:
            # Get plastic types for this enzyme
            cursor.execute('''
                SELECT substrate_code FROM plastic_substrates
                WHERE enzyme_id = ?
                ORDER BY substrate_code
            ''', (row['id'],))
            plastic_list = [r[0] for r in cursor.fetchall()]

            sequences.append(EnzymeSequence(
                id=row['id'],
                plaszyme_id=row['protein_id'],
                accession=row['accession'] or row['protein_id'],
                enzyme_name=row['enzyme_name'] or 'Unknown',
                organism=row['host_organism'] or 'Unknown',
                sequence=row['sequence'] or '',
                plastic_types=plastic_list,
                has_structure=row['structure_url'] is not None
            ))

        conn.close()
        self._sequences = sequences
        return sequences

    def get_all_sequences(self) -> List[EnzymeSequence]:
        """Get all sequences (loads if not cached)"""
        if self._sequences is None:
            self._sequences = self.load_sequences()
        return self._sequences

    def get_database_stats(self) -> Dict:
        """
        Get database statistics for E-value calculation

        Returns dict with:
        - total_sequences: Total number of sequences in database
        - avg_length: Average sequence length
        - total_residues: Total number of residues (for statistical calculations)
        """
        if self._sequences is None:
            self.load_sequences()

        if not self._sequences:
            return {
                'total_sequences': 0,
                'avg_length': 0.0,
                'total_residues': 0
            }

        total_length = sum(len(seq.sequence) for seq in self._sequences)
        total_sequences = len(self._sequences)

        return {
            'total_sequences': total_sequences,
            'avg_length': total_length / total_sequences if total_sequences > 0 else 0.0,
            'total_residues': total_length
        }

    def get_total_count(self) -> int:
        """Get total number of enzymes in database"""
        conn = self._get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM enzymes')
        count = cursor.fetchone()[0]
        conn.close()
        return count

    def get_filtered_count(
        self,
        plastic_types: Optional[List[str]] = None,
        require_structure: bool = False
    ) -> int:
        """Get count of enzymes matching filters"""
        conn = self._get_connection()
        cursor = conn.cursor()

        query = 'SELECT COUNT(DISTINCT e.id) FROM enzymes e'
        conditions = []
        params = []

        if plastic_types:
            placeholders = ','.join(['?'] * len(plastic_types))
            query += ' INNER JOIN plastic_substrates ps ON e.id = ps.enzyme_id'
            conditions.append(f'ps.substrate_code IN ({placeholders})')
            params.extend(plastic_types)

        if require_structure:
            conditions.append('e.structure_url IS NOT NULL')

        if conditions:
            query += ' WHERE ' + ' AND '.join(conditions)

        cursor.execute(query, params)
        count = cursor.fetchone()[0]
        conn.close()
        return count
