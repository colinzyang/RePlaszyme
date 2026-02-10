"""
PlaszymeDB FastAPI Backend
Provides REST API for enzyme database with filtering, search, and pagination
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
from pathlib import Path

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

    # Fetch plastic substrates (major types only)
    cursor.execute('''
        SELECT substrate_code
        FROM plastic_substrates
        WHERE enzyme_id = ? AND substrate_category = 'major'
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
        "message": "PlaszymeDB API",
        "version": "1.0.0",
        "endpoints": {
            "enzymes": "/api/enzymes",
            "enzyme_by_id": "/api/enzymes/{protein_id}",
            "stats": "/api/stats",
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

    # Total structures (PDB IDs)
    cursor.execute('SELECT COUNT(*) FROM identifiers WHERE identifier_type = "pdb"')
    total_structures = cursor.fetchone()[0]

    # Total substrate types
    cursor.execute('SELECT COUNT(DISTINCT substrate_code) FROM plastic_substrates WHERE substrate_category = "major"')
    substrates = cursor.fetchone()[0]

    conn.close()

    return DatabaseStats(
        totalEnzymes=total_enzymes,
        totalOrganisms=total_organisms,
        totalStructures=total_structures,
        substrates=substrates
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
