# PlaszymeDB Quick Reference Guide

## Database Status: ✓ READY

Your `plaszyme.db` is fully populated and operational.

---

## Quick Facts

- **Total Enzymes:** 472
- **All Sequences Loaded:** ✓ (100%)
- **Plastic Substrates:** 717 relationships across 35 types
- **Starting from X0001:** ✓
- **CSV Independent:** ✓

---

## Running the Application

### Backend (Terminal 1)
```bash
cd backend
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)
```bash
# From project root
npm run dev
```

**Note:** Both must be running. Frontend fetches data from backend API.

---

## Database Scripts

### Verify Database (Anytime)
```bash
python3 verify_db_independence.py
```

### Audit & Sync with CSV (If Needed)
```bash
python3 audit_enrich_db.py
```

### Rebuild Database from Scratch
```bash
python3 init_db.py
# Warning: Deletes existing plaszyme.db
```

---

## Sample Database Queries

### Check Enzyme Count
```bash
sqlite3 plaszyme.db "SELECT COUNT(*) FROM enzymes"
# Returns: 472
```

### View X0001
```bash
sqlite3 plaszyme.db "SELECT protein_id, enzyme_name, host_organism, sequence_length FROM enzymes WHERE protein_id='X0001'"
# Returns: X0001|Enzyme 702|T. fusca|262
```

### List PET-Degrading Enzymes
```bash
sqlite3 plaszyme.db "SELECT e.protein_id, e.enzyme_name FROM enzymes e JOIN plastic_substrates ps ON e.id=ps.enzyme_id WHERE ps.substrate_code='PET' LIMIT 10"
```

### Check Substrate Distribution
```bash
sqlite3 plaszyme.db "SELECT substrate_code, COUNT(*) FROM plastic_substrates GROUP BY substrate_code ORDER BY COUNT(*) DESC"
```

---

## Data Quality Notes

**35% of enzymes lack names** - This is from the source CSV, not missing data.
**33% lack organisms** - Same as above.
**0% lack sequences** - All sequences successfully loaded.

To improve: Consider manual curation or automated lookups via UniProt/GenBank APIs.

---

## API Endpoints

Once backend is running at `http://localhost:8000`:

- **Browse enzymes:** `GET /api/enzymes?page=1&limit=10`
- **Search:** `GET /api/enzymes?search=PETase`
- **Filter by plastic:** `GET /api/enzymes?plastic_types=PET&plastic_types=PE`
- **Get enzyme:** `GET /api/enzymes/X0001`
- **Database stats:** `GET /api/stats`
- **API docs:** `http://localhost:8000/docs`

---

## Substrate Codes

### Major Plastics
- **PET** - Polyethylene terephthalate (202 enzymes)
- **PE** - Polyethylene (71 enzymes)
- **PHB** - Polyhydroxybutyrate (83 enzymes)
- **PLA** - Polylactic acid (59 enzymes)
- **PUR** - Polyurethane (43 enzymes)
- **PS** - Polystyrene (5 enzymes)
- **PP** - Polypropylene

### Minor Plastics
PCL, PBAT, PBS, PVA, PA, and 22 others (see [DATABASE_AUDIT_REPORT.md](DATABASE_AUDIT_REPORT.md) for full list)

---

## File Locations

```
RePlaszyme/
├── plaszyme.db                      # SQLite database (REQUIRED)
├── PlaszymeDB_v1.1.csv             # CSV source (for init_db.py only)
├── init_db.py                      # Database initialization
├── audit_enrich_db.py              # One-time sync script
├── verify_db_independence.py       # Verification script
├── DATABASE_AUDIT_REPORT.md        # Detailed report
├── backend/
│   ├── main.py                     # FastAPI backend (queries plaszyme.db)
│   └── requirements.txt
├── services/
│   └── api/
│       └── databaseService.ts      # Frontend API client
└── components/
    ├── Browse.tsx                  # Enzyme browser
    └── EnzymeDetail.tsx            # Detail view with sequence
```

---

## Environment Variables

### .env.local (Frontend)
```bash
VITE_API_URL=http://localhost:8000           # Backend URL (required)
VITE_GEMINI_API_KEY=your_key_here            # AI predictions (optional)
VITE_PRIVATE_MODEL_URL=https://your-model... # Custom model (optional)
```

---

## Troubleshooting

### Backend Error: "Database not found"
```bash
# Check database exists
ls -lh plaszyme.db

# If missing, run:
python3 init_db.py
```

### Frontend Error: "Failed to fetch"
```bash
# Ensure backend is running
curl http://localhost:8000/health

# Should return: {"status":"healthy","database":"connected","enzyme_count":472}
```

### Empty Data in Frontend
```bash
# Verify backend is serving data
curl http://localhost:8000/api/stats

# Should return: {"totalEnzymes":472,...}
```

---

## Support

For issues or questions:
1. Check [DATABASE_AUDIT_REPORT.md](DATABASE_AUDIT_REPORT.md) for detailed analysis
2. Run `verify_db_independence.py` to check database health
3. Review backend logs for API errors
4. Check browser console for frontend errors

---

## What Changed

### Before
- Database had placeholder data
- Some enzymes missing
- Unclear substrate storage

### After
- ✓ All 472 enzymes present (starting from X0001)
- ✓ All sequences loaded for Nightingale viewer
- ✓ 34 plastic columns interpreted and stored
- ✓ App fully independent of CSV
- ✓ Comprehensive verification scripts
