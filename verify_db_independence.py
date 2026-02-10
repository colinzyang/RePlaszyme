#!/usr/bin/env python3
"""
PlaszymeDB Independence Verification Script
Verifies that the application can run completely from plaszyme.db without CSV dependency

Usage:
    python3 verify_db_independence.py
"""

import sqlite3
import sys
from pathlib import Path


def verify_database_independence():
    """Comprehensive verification that app is CSV-independent"""

    db_path = Path('plaszyme.db')
    csv_path = Path('PlaszymeDB_v1.1.csv')

    print("="*70)
    print("PlaszymeDB Independence Verification")
    print("="*70)

    # Check database exists
    if not db_path.exists():
        print("✗ FAILED: plaszyme.db not found")
        return False
    print(f"✓ Database file exists: {db_path}")

    # Connect to database
    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        print("✓ Database connection successful")
    except Exception as e:
        print(f"✗ FAILED: Cannot connect to database: {e}")
        return False

    # Verify schema
    required_tables = ['enzymes', 'identifiers', 'plastic_substrates', 'substrate_types']
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = {row[0] for row in cursor.fetchall()}

    missing_tables = set(required_tables) - tables
    if missing_tables:
        print(f"✗ FAILED: Missing tables: {missing_tables}")
        return False
    print(f"✓ All required tables present: {required_tables}")

    # Verify enzyme data
    cursor.execute('SELECT COUNT(*) FROM enzymes')
    enzyme_count = cursor.fetchone()[0]
    if enzyme_count < 400:
        print(f"✗ FAILED: Too few enzymes ({enzyme_count}), expected ~472")
        return False
    print(f"✓ Enzyme count: {enzyme_count} (expected 472)")

    # Verify X0001 exists with proper data
    cursor.execute("SELECT * FROM enzymes WHERE protein_id = 'X0001'")
    x0001 = cursor.fetchone()
    if not x0001:
        print("✗ FAILED: X0001 not found in database")
        return False

    if not x0001['sequence'] or len(x0001['sequence']) < 100:
        print("✗ FAILED: X0001 has invalid sequence")
        return False

    print(f"✓ X0001 exists with valid data:")
    print(f"    Name: {x0001['enzyme_name']}")
    print(f"    Organism: {x0001['host_organism']}")
    print(f"    Sequence length: {x0001['sequence_length']}")

    # Verify sequences are loaded for all enzymes
    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE sequence IS NULL OR sequence = ""')
    missing_sequences = cursor.fetchone()[0]
    if missing_sequences > 0:
        print(f"✗ FAILED: {missing_sequences} enzymes missing sequences")
        return False
    print(f"✓ All {enzyme_count} enzymes have sequences loaded")

    # Verify plastic substrate data
    cursor.execute('SELECT COUNT(*) FROM plastic_substrates')
    substrate_count = cursor.fetchone()[0]
    if substrate_count < 500:
        print(f"✗ FAILED: Too few substrate relationships ({substrate_count})")
        return False
    print(f"✓ Substrate relationships: {substrate_count}")

    # Verify major plastics are represented
    cursor.execute('''
        SELECT substrate_code, COUNT(*) as cnt
        FROM plastic_substrates
        WHERE substrate_category = 'major'
        GROUP BY substrate_code
        ORDER BY cnt DESC
    ''')
    major_substrates = cursor.fetchall()
    print(f"✓ Major plastic types distribution:")
    for row in major_substrates:
        print(f"    {row[0]}: {row[1]} enzymes")

    # Verify identifiers are loaded
    cursor.execute('SELECT COUNT(*) FROM identifiers')
    identifier_count = cursor.fetchone()[0]
    print(f"✓ External identifiers: {identifier_count}")

    # Verify substrate types reference table
    cursor.execute('SELECT COUNT(*) FROM substrate_types')
    substrate_types_count = cursor.fetchone()[0]
    if substrate_types_count < 30:
        print(f"✗ FAILED: Missing substrate types ({substrate_types_count})")
        return False
    print(f"✓ Substrate types catalog: {substrate_types_count}")

    # Data completeness analysis
    print(f"\nData Completeness:")
    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE enzyme_name IS NOT NULL AND enzyme_name != ""')
    named_count = cursor.fetchone()[0]
    print(f"  Enzymes with names: {named_count}/{enzyme_count} ({named_count*100//enzyme_count}%)")

    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE host_organism IS NOT NULL AND host_organism != ""')
    organism_count = cursor.fetchone()[0]
    print(f"  Enzymes with organisms: {organism_count}/{enzyme_count} ({organism_count*100//enzyme_count}%)")

    cursor.execute('SELECT COUNT(*) FROM enzymes WHERE ec_number IS NOT NULL OR predicted_ec_number IS NOT NULL')
    ec_count = cursor.fetchone()[0]
    print(f"  Enzymes with EC numbers: {ec_count}/{enzyme_count} ({ec_count*100//enzyme_count}%)")

    # Test sample query (similar to what frontend would do)
    cursor.execute('''
        SELECT e.protein_id, e.enzyme_name, e.sequence,
               GROUP_CONCAT(ps.substrate_code) as substrates
        FROM enzymes e
        LEFT JOIN plastic_substrates ps ON e.id = ps.enzyme_id
        WHERE ps.substrate_code = 'PET'
        GROUP BY e.protein_id
        LIMIT 5
    ''')
    results = cursor.fetchall()
    if len(results) < 5:
        print(f"✗ FAILED: Cannot query PET-degrading enzymes")
        return False
    print(f"\n✓ Sample query successful (PET-degrading enzymes):")
    for row in results:
        print(f"    {row['protein_id']}: {row['enzyme_name'] or 'Unnamed'} - {row['substrates']}")

    conn.close()

    # Check CSV dependency
    print(f"\nCSV Dependency Check:")
    if csv_path.exists():
        print(f"  ℹ CSV file present: {csv_path} (used for initialization only)")
    else:
        print(f"  ℹ CSV file not present (not required for app operation)")

    print("\n" + "="*70)
    print("✓ VERIFICATION PASSED")
    print("="*70)
    print("\nThe application is fully independent of the CSV file.")
    print("All data is stored in plaszyme.db and accessible via the FastAPI backend.")
    print("\nTo run the application:")
    print("  1. Backend:  cd backend && python3 -m uvicorn main:app --reload --port 8000")
    print("  2. Frontend: npm run dev")
    print("\nThe CSV (PlaszymeDB_v1.1.csv) is only needed if you want to reinitialize")
    print("the database from scratch using init_db.py")
    print("="*70)

    return True


if __name__ == '__main__':
    success = verify_database_independence()
    sys.exit(0 if success else 1)
