"""
BLAST Aligner Module
Performs local sequence alignment using BioPython's PairwiseAligner
Implements Smith-Waterman algorithm with BLOSUM62 substitution matrix
"""

import math
import time
from typing import List, Optional, Dict, Any
from dataclasses import dataclass

from Bio.Align import PairwiseAligner, substitution_matrices

from .database import EnzymeSequence, SequenceDatabase


@dataclass
class BlastHit:
    """Represents a single BLAST alignment hit"""
    plaszyme_id: str
    accession: str
    description: str
    organism: str
    plastic_types: List[str]
    max_score: float
    query_cover: float
    e_value: float
    percent_identity: float
    alignment_length: int
    has_structure: bool

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            'plaszyme_id': self.plaszyme_id,
            'accession': self.accession,
            'description': self.description,
            'organism': self.organism,
            'plastic_types': self.plastic_types,
            'max_score': self.max_score,
            'query_cover': self.query_cover,
            'e_value': self.e_value,
            'percent_identity': self.percent_identity,
            'alignment_length': self.alignment_length,
            'has_structure': self.has_structure
        }


class BlastAligner:
    """
    Local sequence aligner using BioPython's PairwiseAligner
    Implements Smith-Waterman local alignment with BLOSUM62 matrix
    """

    # Karlin-Altschul parameters for BLOSUM62 (standard values)
    # Lambda and K are used for E-value calculation
    KAPPA_LAMBDA = 0.267  # Lambda parameter for BLOSUM62
    KAPPA_K = 0.041  # K parameter for BLOSUM62

    def __init__(self, db: Optional[SequenceDatabase] = None):
        """
        Initialize the aligner

        Args:
            db: SequenceDatabase instance for loading sequences
        """
        self.db = db or SequenceDatabase()

        # Initialize PairwiseAligner with Smith-Waterman settings
        self.aligner = PairwiseAligner()
        self.aligner.mode = 'local'  # Smith-Waterman local alignment
        self.aligner.substitution_matrix = substitution_matrices.load("BLOSUM62")

        # Gap penalties (standard values for protein alignment)
        self.aligner.open_gap_score = -11  # Gap open penalty
        self.aligner.extend_gap_score = -1  # Gap extension penalty

        # Target query coverage for alignment
        self._query_length = 0

    # Standard amino acids supported by BLOSUM62
    STANDARD_AMINO_ACIDS = set('ACDEFGHIKLMNPQRSTVWY')

    def _clean_sequence(self, sequence: str) -> str:
        """
        Clean and validate protein sequence

        - Removes FASTA header if present
        - Removes whitespace
        - Converts to uppercase
        - Replaces non-standard amino acids with X (unknown)
        """
        lines = sequence.strip().split('\n')

        # Remove FASTA header lines
        sequence_lines = [line for line in lines if not line.startswith('>')]

        # Join and clean
        cleaned = ''.join(sequence_lines)
        cleaned = ''.join(c for c in cleaned if c.isalpha()).upper()

        # Replace non-standard amino acids with X
        # BLOSUM62 supports standard 20 AA + B, Z, X (ambiguous)
        # But U (Selenocysteine) and O (Pyrrolysine) are not supported
        cleaned = ''.join(
            c if c in self.STANDARD_AMINO_ACIDS or c in 'BZX' else 'X'
            for c in cleaned
        )

        return cleaned

    def _calculate_e_value(self, score: float, db_size: int, db_length: int) -> float:
        """
        Calculate E-value using Karlin-Altschul statistics

        E = K * m * n * e^(-lambda * S)

        Where:
        - K, lambda: Karlin-Altschul parameters for the scoring system
        - m: query sequence length
        - n: database length (total residues)
        - S: alignment score

        Args:
            score: Raw alignment score
            db_size: Number of sequences in database
            db_length: Total residues in database

        Returns:
            E-value (expected number of chance alignments)
        """
        if score <= 0:
            return float('inf')

        m = self._query_length
        n = db_length

        # E-value calculation
        e_value = (self.KAPPA_K * m * n * math.exp(-self.KAPPA_LAMBDA * score))

        return e_value

    def _calculate_query_coverage(
        self,
        query_start: int,
        query_end: int,
        query_length: int
    ) -> float:
        """Calculate percentage of query sequence covered by alignment"""
        if query_length == 0:
            return 0.0
        return ((query_end - query_start) / query_length) * 100

    def _calculate_percent_identity(
        self,
        alignments_count: int,
        alignment_length: int
    ) -> float:
        """Calculate percentage identity in alignment"""
        if alignment_length == 0:
            return 0.0
        return (alignments_count / alignment_length) * 100

    def align(
        self,
        query_sequence: str,
        plastic_types: Optional[List[str]] = None,
        require_structure: bool = False,
        max_results: int = 100,
        similarity_threshold: float = 30.0
    ) -> tuple[List[BlastHit], int, int]:
        """
        Perform local alignment of query sequence against database

        Args:
            query_sequence: Query protein sequence (FASTA format or raw)
            plastic_types: Filter database by plastic substrate types
            require_structure: Only include enzymes with known structures
            max_results: Maximum number of results to return
            similarity_threshold: Minimum percent identity threshold

        Returns:
            Tuple of (hits list, total database size, filtered database size)
        """
        start_time = time.time()

        # Clean and validate query sequence
        query = self._clean_sequence(query_sequence)
        self._query_length = len(query)

        if self._query_length == 0:
            return [], 0, 0

        # Load sequences from database
        sequences = self.db.load_sequences(
            plastic_types=plastic_types,
            require_structure=require_structure
        )

        total_db_count = self.db.get_total_count()
        filtered_db_count = len(sequences)

        # Get database stats for E-value calculation
        db_stats = self.db.get_database_stats()
        db_length = db_stats['total_residues']

        # Perform alignment against each sequence
        hits: List[BlastHit] = []

        for enzyme in sequences:
            if not enzyme.sequence:
                continue

            try:
                # Clean target sequence to handle non-standard amino acids
                target_seq = self._clean_sequence(enzyme.sequence)

                # Get best local alignment
                alignments = self.aligner.align(query, target_seq)

                if not alignments or len(alignments) == 0:
                    continue

                # Get the best alignment (first one)
                best_alignment = alignments[0]
                score = best_alignment.score

                # Extract alignment details using .aligned property
                # .aligned returns [[[q_start, q_end], ...], [[t_start, t_end], ...]]
                aligned_regions = best_alignment.aligned
                query_regions = aligned_regions[0]  # List of (start, end) tuples for query
                target_regions = aligned_regions[1]  # List of (start, end) tuples for target

                # Calculate alignment length and query coverage
                if len(query_regions) > 0:
                    query_start = query_regions[0][0]
                    query_end = query_regions[-1][1]
                    alignment_length = sum(
                        end - start for start, end in query_regions
                    )
                else:
                    query_start, query_end = 0, 0
                    alignment_length = 0

                query_cover = self._calculate_query_coverage(
                    query_start, query_end, self._query_length
                )

                # Calculate percent identity by comparing aligned regions directly
                identical_count = 0
                compared_positions = 0

                # Compare each aligned region position by position
                for q_region, t_region in zip(query_regions, target_regions):
                    q_start, q_end = q_region
                    t_start, t_end = t_region

                    # Region lengths should match in local alignment
                    region_length = min(q_end - q_start, t_end - t_start)

                    # Compare each position in the aligned region
                    for i in range(region_length):
                        q_char = query[q_start + i]
                        t_char = target_seq[t_start + i]
                        compared_positions += 1
                        if q_char == t_char:
                            identical_count += 1

                # Calculate percent identity over all compared positions
                percent_identity = (
                    (identical_count / compared_positions * 100)
                    if compared_positions > 0 else 0
                )

                # Apply similarity threshold filter
                if percent_identity < similarity_threshold:
                    continue

                # Calculate E-value
                e_value = self._calculate_e_value(score, filtered_db_count, db_length)

                # Create hit
                hit = BlastHit(
                    plaszyme_id=enzyme.plaszyme_id,
                    accession=enzyme.accession,
                    description=enzyme.enzyme_name,
                    organism=enzyme.organism,
                    plastic_types=enzyme.plastic_types,
                    max_score=round(score, 1),
                    query_cover=round(query_cover, 1),
                    e_value=e_value,
                    percent_identity=round(percent_identity, 2),
                    alignment_length=alignment_length,
                    has_structure=enzyme.has_structure
                )
                hits.append(hit)

            except Exception as e:
                # Skip sequences that fail alignment
                print(f"Warning: Alignment failed for {enzyme.plaszyme_id}: {e}")
                continue

        # Sort by score (descending)
        hits.sort(key=lambda x: x.max_score, reverse=True)

        # Limit results
        hits = hits[:max_results]

        elapsed_time = time.time() - start_time
        print(f"BLAST completed in {elapsed_time:.2f}s, found {len(hits)} hits")

        return hits, total_db_count, filtered_db_count

    def get_query_info(self, sequence: str) -> Dict[str, Any]:
        """
        Get information about the query sequence

        Returns:
            Dict with length and preview of cleaned sequence
        """
        cleaned = self._clean_sequence(sequence)
        preview = cleaned[:50] + '...' if len(cleaned) > 50 else cleaned

        return {
            'length': len(cleaned),
            'sequence_preview': preview
        }
