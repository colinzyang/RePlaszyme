"""
PlaszymeDB FastAPI Backend
Provides REST API for enzyme database with filtering, search, and pagination
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import sqlite3
from pathlib import Path
import time

# Import BLAST service
from services.blast import BlastAligner, SequenceDatabase

app = FastAPI(
    title="PlaszymeDB API",
    description="REST API for plastic-degrading enzyme database",
    version="1.0.0"
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Vite dev server (primary)
        "http://localhost:3001",   # Vite dev server (alternative)
        "http://localhost:3002",   # Vite dev server (alternative)
        "http://localhost:5173",   # Default Vite port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database path
DB_PATH = Path(__file__).parent.parent / "plaszyme.db"


# Pydantic models
class EnzymeResponse(BaseModel):
    id: str  # Plaszyme ID (e.g., X0001, X0031)
    plaszymeId: str  # Explicit Plaszyme ID for clarity
    plzId: Optional[str]  # PLZ_ID hash identifier
    accession: str  # External database accession (GenBank/UniProt)
    genbankId: Optional[str]  # Primary GenBank ID
    uniprotId: Optional[str]  # Primary UniProt ID
    name: str
    ecNumber: str
    organism: str
    taxonomy: str
    plasticType: List[str]
    length: int
    weight: str
    temperature: str
    ph: str
    pdbId: Optional[str]
    sequence: str
    reference: str
    structureUrl: Optional[str]


class PaginatedEnzymeResponse(BaseModel):
    data: List[EnzymeResponse]
    total: int
    page: int
    limit: int
    totalPages: int


class DatabaseStats(BaseModel):
    totalEnzymes: int
    totalOrganisms: int
    totalStructures: int
    substrates: int


class DatabaseMetadata(BaseModel):
    dbName: str
    dbVersion: str
    dbLicense: str
    dbLicenseUrl: str
    dataSource: str
    createdAt: str
    totalEnzymes: str
    description: str


# BLAST API Models
class BlastRequest(BaseModel):
    """Request model for BLAST alignment"""
    sequence: str = Field(..., description="Query protein sequence (FASTA or raw)")
    max_results: int = Field(default=100, ge=1, le=500, description="Maximum results to return")
    similarity_threshold: str = Field(default="30", description="Minimum percent identity threshold")
    plastic_types: Optional[List[str]] = Field(default=None, description="Filter by plastic substrate types")
    require_structure: bool = Field(default=False, description="Only include enzymes with known structures")


class BlastQueryInfo(BaseModel):
    """Information about the query sequence"""
    length: int
    sequence_preview: str


class BlastHitResponse(BaseModel):
    """Single BLAST alignment hit"""
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


class BlastResponse(BaseModel):
    """Response model for BLAST alignment"""
    results: List[BlastHitResponse]
    total: int = Field(description="Total sequences in database")
    filtered: int = Field(description="Sequences matching filter criteria")
    query_info: BlastQueryInfo
    execution_time_ms: float


# Database connection helper
def get_db():
    """Get database connection with row factory"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def row_to_enzyme(row: sqlite3.Row, cursor: sqlite3.Cursor) -> EnzymeResponse:
    """Convert database row to Enzyme response model"""
    enzyme_id = row['id']
    plaszyme_id = row['protein_id']

    # Fetch plastic substrates (all types)
    cursor.execute('''
        SELECT substrate_code
        FROM plastic_substrates
        WHERE enzyme_id = ?
        ORDER BY substrate_code
    ''', (enzyme_id,))
    plastic_types = [r[0] for r in cursor.fetchall()]

    # Fetch primary PDB ID
    cursor.execute('''
        SELECT identifier_value
        FROM identifiers
        WHERE enzyme_id = ? AND identifier_type = 'pdb'
        LIMIT 1
    ''', (enzyme_id,))
    pdb_result = cursor.fetchone()
    pdb_id = pdb_result[0] if pdb_result else None

    # Fetch primary GenBank ID
    cursor.execute('''
        SELECT identifier_value
        FROM identifiers
        WHERE enzyme_id = ? AND identifier_type = 'genbank'
        LIMIT 1
    ''', (enzyme_id,))
    genbank_result = cursor.fetchone()
    genbank_id = genbank_result[0] if genbank_result else None

    # Fetch primary UniProt ID
    cursor.execute('''
        SELECT identifier_value
        FROM identifiers
        WHERE enzyme_id = ? AND identifier_type = 'uniprot'
        LIMIT 1
    ''', (enzyme_id,))
    uniprot_result = cursor.fetchone()
    uniprot_id = uniprot_result[0] if uniprot_result else None

    return EnzymeResponse(
        id=plaszyme_id,
        plaszymeId=plaszyme_id,
        plzId=row['plz_id'],
        accession=row['accession'] or plaszyme_id,
        genbankId=genbank_id,
        uniprotId=uniprot_id,
        name=row['enzyme_name'] or 'Unknown',
        ecNumber=row['ec_number'] or row['predicted_ec_number'] or 'N/A',
        organism=row['host_organism'] or 'Unknown',
        taxonomy=row['taxonomy'] or '',
        plasticType=plastic_types,
        length=row['sequence_length'] or 0,
        weight=row['molecular_weight'] or 'N/A',
        temperature=row['optimal_temperature'] or 'N/A',
        ph=row['optimal_ph'] or 'N/A',
        pdbId=pdb_id,
        sequence=row['sequence'],
        reference=row['reference'] or 'Unpublished',
        structureUrl=row['structure_url']
    )


@app.get("/")
def read_root():
    """Root endpoint"""
    return {
        "message": "RePlaszyme API",
        "version": "1.0.0",
        "license": "MIT",
        "license_url": "https://opensource.org/licenses/MIT",
        "endpoints": {
            "enzymes": "/api/enzymes",
            "enzyme_by_id": "/api/enzymes/{protein_id}",
            "export": "/api/enzymes/export",
            "stats": "/api/stats",
            "metadata": "/api/metadata",
            "docs": "/docs"
        }
    }


@app.get("/api/enzymes", response_model=PaginatedEnzymeResponse)
def get_enzymes(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for name, organism, or accession"),
    plastic_types: Optional[List[str]] = Query(None, description="Filter by plastic substrate types")
):
    """
    Get paginated list of enzymes with optional filtering

    - **page**: Page number (starts at 1)
    - **limit**: Number of items per page (max 100)
    - **search**: Search in enzyme name, organism, or accession
    - **plastic_types**: Filter by plastic types (PET, PE, PLA, PHB, PS, PUR, PP)
    """
    conn = get_db()
    cursor = conn.cursor()

    # Build WHERE clause
    where_conditions = []
    params = []

    if search:
        where_conditions.append('''
            (enzyme_name LIKE ? OR host_organism LIKE ? OR accession LIKE ?)
        ''')
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    if plastic_types:
        placeholders = ','.join(['?'] * len(plastic_types))
        where_conditions.append(f'''
            id IN (
                SELECT enzyme_id FROM plastic_substrates
                WHERE substrate_code IN ({placeholders})
            )
        ''')
        params.extend(plastic_types)

    where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""

    # Get total count
    count_query = f"SELECT COUNT(*) FROM enzymes {where_clause}"
    cursor.execute(count_query, params)
    total = cursor.fetchone()[0]

    # Get paginated results
    offset = (page - 1) * limit
    data_query = f'''
        SELECT * FROM enzymes
        {where_clause}
        ORDER BY protein_id
        LIMIT ? OFFSET ?
    '''
    cursor.execute(data_query, params + [limit, offset])
    rows = cursor.fetchall()

    # Convert rows to enzyme models
    enzymes = [row_to_enzyme(row, cursor) for row in rows]

    conn.close()

    return PaginatedEnzymeResponse(
        data=enzymes,
        total=total,
        page=page,
        limit=limit,
        totalPages=(total + limit - 1) // limit  # Ceiling division
    )


@app.get("/api/enzymes/{protein_id}", response_model=EnzymeResponse)
def get_enzyme_by_id(protein_id: str):
    """
    Get a single enzyme by its protein ID

    - **protein_id**: The enzyme's protein ID (e.g., X0001)
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM enzymes WHERE protein_id = ?', (protein_id,))
    row = cursor.fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Enzyme {protein_id} not found")

    enzyme = row_to_enzyme(row, cursor)
    conn.close()

    return enzyme


@app.get("/api/enzymes/export")
def export_all_enzymes(
    search: Optional[str] = Query(None, description="Search term"),
    plastic_types: Optional[List[str]] = Query(None, description="Filter by plastic types")
):
    """
    Export all enzymes matching filters as CSV

    Returns complete dataset based on current filters
    """
    conn = get_db()
    cursor = conn.cursor()

    # Build WHERE clause (same as get_enzymes)
    where_conditions = []
    params = []

    if search:
        where_conditions.append('''
            (enzyme_name LIKE ? OR host_organism LIKE ? OR accession LIKE ?)
        ''')
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])

    if plastic_types:
        placeholders = ','.join(['?'] * len(plastic_types))
        where_conditions.append(f'''
            id IN (
                SELECT enzyme_id FROM plastic_substrates
                WHERE substrate_code IN ({placeholders})
            )
        ''')
        params.extend(plastic_types)

    where_clause = f"WHERE {' AND '.join(where_conditions)}" if where_conditions else ""

    # Get ALL results (no pagination)
    data_query = f'''
        SELECT * FROM enzymes
        {where_clause}
        ORDER BY protein_id
    '''
    cursor.execute(data_query, params)
    rows = cursor.fetchall()

    # Convert rows to enzyme models
    enzymes = [row_to_enzyme(row, cursor) for row in rows]

    conn.close()

    return {
        "data": enzymes,
        "total": len(enzymes)
    }


@app.get("/api/stats", response_model=DatabaseStats)
def get_database_stats():
    """
    Get database statistics

    Returns total counts for enzymes, organisms, structures, and substrates
    """
    conn = get_db()
    cursor = conn.cursor()

    # Total enzymes
    cursor.execute('SELECT COUNT(*) FROM enzymes')
    total_enzymes = cursor.fetchone()[0]

    # Total unique organisms
    cursor.execute('SELECT COUNT(DISTINCT host_organism) FROM enzymes WHERE host_organism IS NOT NULL')
    total_organisms = cursor.fetchone()[0]

    # Total structures (S3 predicted structure URLs)
    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE structure_url IS NOT NULL')
    total_structures = cursor.fetchone()[0]

    # Total substrate types (all categories, not just major)
    cursor.execute('SELECT COUNT(DISTINCT substrate_code) FROM plastic_substrates')
    substrates = cursor.fetchone()[0]

    conn.close()

    return DatabaseStats(
        totalEnzymes=total_enzymes,
        totalOrganisms=total_organisms,
        totalStructures=total_structures,
        substrates=substrates
    )


@app.get("/api/metadata", response_model=DatabaseMetadata)
def get_database_metadata():
    """
    Get database metadata including license information

    Returns database version, license (MIT), and other metadata
    """
    conn = get_db()
    cursor = conn.cursor()

    # Get all metadata from db_metadata table
    cursor.execute('SELECT key, value FROM db_metadata')
    metadata_rows = cursor.fetchall()

    metadata = {row[0]: row[1] for row in metadata_rows}
    conn.close()

    return DatabaseMetadata(
        dbName=metadata.get('db_name', 'RePlaszyme'),
        dbVersion=metadata.get('db_version', '1.1'),
        dbLicense=metadata.get('db_license', 'MIT'),
        dbLicenseUrl=metadata.get('db_license_url', 'https://opensource.org/licenses/MIT'),
        dataSource=metadata.get('data_source', 'PlaszymeDB_v1.1.csv'),
        createdAt=metadata.get('created_at', ''),
        totalEnzymes=metadata.get('total_enzymes', '474'),
        description=metadata.get('description', '')
    )


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM enzymes')
        count = cursor.fetchone()[0]
        conn.close()
        return {
            "status": "healthy",
            "database": "connected",
            "enzyme_count": count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


# Initialize BLAST aligner (lazy loaded)
_blast_aligner: Optional[BlastAligner] = None


def get_blast_aligner() -> BlastAligner:
    """Get or create BLAST aligner instance"""
    global _blast_aligner
    if _blast_aligner is None:
        db = SequenceDatabase(DB_PATH)
        _blast_aligner = BlastAligner(db)
    return _blast_aligner


@app.post("/api/blast", response_model=BlastResponse)
def blast_search(request: BlastRequest):
    """
    Perform local sequence alignment against PlaszymeDB

    Uses Smith-Waterman local alignment with BLOSUM62 substitution matrix.

    - **sequence**: Query protein sequence (FASTA format or raw amino acids)
    - **max_results**: Maximum number of results to return (1-500)
    - **similarity_threshold**: Minimum percent identity threshold (e.g., "30" for >30%)
    - **plastic_types**: Filter database by plastic substrate types
    - **require_structure**: Only include enzymes with known 3D structures
    """
    start_time = time.time()

    try:
        # Parse similarity threshold
        try:
            threshold = float(request.similarity_threshold)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid similarity_threshold: {request.similarity_threshold}"
            )

        # Get aligner
        aligner = get_blast_aligner()

        # Get query info
        query_info = aligner.get_query_info(request.sequence)

        if query_info['length'] == 0:
            raise HTTPException(
                status_code=400,
                detail="Invalid sequence: No valid amino acid characters found"
            )

        # Perform alignment
        hits, total_count, filtered_count = aligner.align(
            query_sequence=request.sequence,
            plastic_types=request.plastic_types,
            require_structure=request.require_structure,
            max_results=request.max_results,
            similarity_threshold=threshold
        )

        # Calculate execution time
        execution_time_ms = (time.time() - start_time) * 1000

        # Convert hits to response format
        result_hits = [
            BlastHitResponse(
                plaszyme_id=hit.plaszyme_id,
                accession=hit.accession,
                description=hit.description,
                organism=hit.organism,
                plastic_types=hit.plastic_types,
                max_score=hit.max_score,
                query_cover=hit.query_cover,
                e_value=hit.e_value,
                percent_identity=hit.percent_identity,
                alignment_length=hit.alignment_length,
                has_structure=hit.has_structure
            )
            for hit in hits
        ]

        return BlastResponse(
            results=result_hits,
            total=total_count,
            filtered=filtered_count,
            query_info=BlastQueryInfo(
                length=query_info['length'],
                sequence_preview=query_info['sequence_preview']
            ),
            execution_time_ms=round(execution_time_ms, 2)
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"BLAST alignment failed: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
