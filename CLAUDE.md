# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PlaszymeDB** is a full-stack web application for plastic-degrading enzymes with AI-powered sequence analysis and 3D structure visualization. The architecture consists of:

- **Frontend**: React + TypeScript (Vite) with custom view-based navigation
- **Backend**: FastAPI (Python) REST API with SQLite database
- **Data**: 472 enzymes from PlaszymeDB_v1.1.csv with normalized relational schema
- **AI Integration**: Google Gemini for protein sequence analysis

**Project Structure:** Flat file structure (no `src/` directory). Components in `./components/`, services in `./services/`, backend in `./backend/`, with main files in project root.

## File Structure

```
RePlaszyme/
├── backend/                 # FastAPI backend
│   ├── main.py             # REST API endpoints
│   └── requirements.txt    # Python dependencies
├── components/              # React components
│   ├── Browse.tsx          # Enzyme browsing (async data from API)
│   ├── EnzymeDetail.tsx    # Enzyme details with 3D structure
│   ├── Predictor.tsx       # Gemini AI sequence analysis
│   ├── StatsCards.tsx      # Real-time database statistics
│   ├── LoadingSpinner.tsx  # Loading state UI
│   ├── ErrorMessage.tsx    # Error state UI
│   └── ...                 # Other view components
├── services/
│   ├── api/
│   │   └── databaseService.ts  # API client for backend
│   └── geminiService.ts    # Gemini AI integration
├── App.tsx                 # Main app with async stats loading
├── types.ts                # TypeScript types (includes structureUrl)
├── constants.ts            # Static data (TIMELINE_EVENTS only)
├── init_db.py              # Database initialization script
├── plaszyme.db             # SQLite database (gitignored)
├── PlaszymeDB_v1.1.csv    # Raw enzyme data (474 enzymes)
├── .env.local              # API URL & Gemini key (gitignored)
└── vite.config.ts          # Vite config with @/ alias
```

## Development Commands

### Initial Setup

**1. Database Initialization:**
```bash
python3 init_db.py
# Creates plaszyme.db from PlaszymeDB_v1.1.csv
# Imports 472 enzymes into normalized SQLite schema
```

**2. Frontend Setup:**
```bash
npm install
```

Create `.env.local` in project root:
```
VITE_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
```

**3. Backend Setup:**
```bash
cd backend
pip3 install -r requirements.txt
```

### Running the Application

**Terminal 1 - Backend (Required):**
```bash
# From backend/ directory
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
# From project root
npm run dev
# Starts Vite dev server (usually http://localhost:3000)
```

**Note:** Both backend and frontend must be running. Frontend fetches data from backend API.

### Production Build

```bash
npm run build        # Build frontend
npm run preview      # Preview production build
```

**Backend Production:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

**Note:** No test runner or linter is currently configured.

## Architecture

### Full-Stack Architecture

```
┌─────────────────────────────────────────┐
│  React Frontend (Vite)                  │
│  - Browse.tsx: Async enzyme fetching   │
│  - App.tsx: Stats loading              │
│  - databaseService.ts: API client      │
└──────────────┬──────────────────────────┘
               │ HTTP REST API
               │ (fetch calls)
┌──────────────▼──────────────────────────┐
│  FastAPI Backend (Python)               │
│  GET /api/enzymes (pagination/filters) │
│  GET /api/enzymes/{id}                  │
│  GET /api/stats                         │
└──────────────┬──────────────────────────┘
               │ SQLite queries
┌──────────────▼──────────────────────────┐
│  SQLite Database (plaszyme.db)          │
│  - enzymes (472 records)                │
│  - identifiers (GenBank, PDB, UniProt)  │
│  - plastic_substrates (junction table)  │
└─────────────────────────────────────────┘
```

### Frontend: Single-Page Application

The React app uses custom view-switching (no React Router):

- **View Types**: `home` | `browse` | `blast` | `phylogeny` | `predictor` | `about` | `detail`
- **Navigation**: `handleNavigate()` in App.tsx updates `currentView` state
- **Deep linking**: Not supported; refresh returns to home

### Frontend State Management

**App.tsx manages:**
1. `currentView` - Which component renders
2. `selectedEnzyme` - Enzyme for detail view
3. `dbStats` - Database statistics from API
4. `isStatsLoading` / `statsError` - Loading states

Components receive callbacks:
```typescript
onNavigate: (view: string) => void
onSelectEnzyme: (enzyme: Enzyme) => void
```

### Data Layer Architecture

**Backend (FastAPI + SQLite):**
- [backend/main.py](backend/main.py) - REST API with CORS, Pydantic models
- Database schema:
  - `enzymes` - Core enzyme data (protein_id, sequence, ec_number, etc.)
  - `identifiers` - External IDs (GenBank, PDB, UniProt, RefSeq)
  - `plastic_substrates` - Many-to-many enzyme ↔ plastic types
  - `substrate_types` - Reference data for plastic substrates
- Indexed for performance (accession, protein_id, substrate_code)

**Frontend Service Layer:**
- [services/api/databaseService.ts](services/api/databaseService.ts) - TypeScript API client
- Functions: `getEnzymes()`, `getEnzymeById()`, `getDatabaseStats()`
- Returns typed `PaginatedResult<Enzyme>` and `DatabaseStats`

**Static Data:**
- [constants.ts](constants.ts) - Only contains `TIMELINE_EVENTS` (not enzyme data)
- Enzyme data now fetched from backend API dynamically

### AI Integration

[services/geminiService.ts](services/geminiService.ts) handles Gemini AI integration:
- Uses `@google/genai` package
- API key injected via Vite's `define` config (process.env.API_KEY)
- Function: `analyzeProteinSequence(sequence: string)` - analyzes protein sequences for plastic-degrading properties

### Environment Variables

**.env.local (frontend):**
```typescript
VITE_API_URL=http://localhost:8000  // Backend API URL
GEMINI_API_KEY=your_key_here        // For Predictor.tsx AI analysis
```

Vite config exposes these via `import.meta.env`:
- `import.meta.env.VITE_API_URL` - Used in [databaseService.ts](services/api/databaseService.ts)
- `import.meta.env.VITE_GEMINI_API_KEY` - Injected as `process.env.GEMINI_API_KEY` via `define` config

**Path Alias:** `@/` resolves to project root ([vite.config.ts](vite.config.ts), [tsconfig.json](tsconfig.json))
```typescript
import { Enzyme } from '@/types';
import { getEnzymes } from '@/services/api/databaseService';
```

## Component Organization

**Data-Driven Components:**
- [components/Browse.tsx](components/Browse.tsx) - Async enzyme browsing with server-side pagination, filtering (by plastic type), and search. Uses `getEnzymes()` from databaseService
- [components/StatsCards.tsx](components/StatsCards.tsx) - Displays real database stats from `getDatabaseStats()`. Props: `stats`, `isLoading`
- [components/EnzymeDetail.tsx](components/EnzymeDetail.tsx) - 3D structure viewer with S3 support. Handles 3 structure sources: S3 custom URL → PDB ID → AlphaFold prediction

**AI/Analysis Components:**
- [components/Predictor.tsx](components/Predictor.tsx) - Gemini AI sequence analysis (unchanged, uses [geminiService.ts](services/geminiService.ts))
- [components/Blast.tsx](components/Blast.tsx) - BLAST alignment interface
- [components/Phylogeny.tsx](components/Phylogeny.tsx) - Phylogenetic analysis

**UI Components:**
- [components/LoadingSpinner.tsx](components/LoadingSpinner.tsx) - Reusable loading state
- [components/ErrorMessage.tsx](components/ErrorMessage.tsx) - Error display with icon

**Static Components:**
- [components/Hero.tsx](components/Hero.tsx), [components/About.tsx](components/About.tsx), [components/Navbar.tsx](components/Navbar.tsx), [components/Footer.tsx](components/Footer.tsx), [components/Timeline.tsx](components/Timeline.tsx)

## TypeScript Types

Core types in [types.ts](types.ts):
- `Enzyme` - Main data structure with `structureUrl?: string` for S3 PDB files
- `PlasticType` - Enum for substrates (PET, PE, PP, PS, PUR, PLA, PHB)
- `StructureSource` - Type alias: `'pdb' | 's3' | 'alphafold'`
- `AnalysisResult` - Gemini AI output
- `TimelineEvent` - Static timeline events

**Service Layer Types:**
```typescript
// In services/api/databaseService.ts
interface FilterOptions {
    searchTerm?: string;
    plasticTypes?: PlasticType[];
    page?: number;
    limit?: number;
}

interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

interface DatabaseStats {
    totalEnzymes: number;
    totalOrganisms: number;
    totalStructures: number;
    substrates: number;
}
```

## Important Patterns

### Adding New Enzymes

**To add enzymes to the database:**
1. Add rows to PlaszymeDB_v1.1.csv
2. Re-run `python3 init_db.py` (deletes and recreates database)
3. Restart backend server

**Do not** modify [constants.ts](constants.ts) `PLASZYME_DATA` - it's no longer used for enzyme data.

### Backend API Patterns

**Query parameters:**
```python
# GET /api/enzymes?page=1&limit=10&search=PETase&plastic_types=PET&plastic_types=PE
```

**Adding new endpoints:**
1. Add Pydantic model in [backend/main.py](backend/main.py)
2. Create endpoint function with `@app.get()` or `@app.post()`
3. Use `get_db()` helper for database connection
4. Return Pydantic model for automatic validation

**Frontend consumption:**
```typescript
// Add function to services/api/databaseService.ts
export async function newEndpoint() {
    const response = await fetch(`${API_BASE_URL}/api/new-endpoint`);
    return response.json();
}
```

### Component Data Loading Pattern

Components that need backend data use `useEffect`:

```typescript
const [data, setData] = useState<Enzyme[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const result = await getEnzymes({ page: 1, limit: 10 });
            setData(result.data);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };
    fetchData();
}, [dependencies]);
```

### Structure Visualization Priority

[EnzymeDetail.tsx](components/EnzymeDetail.tsx) uses 3-source fallback:
1. **S3 Custom Structure**: If `enzyme.structureUrl` exists, load via `custom-data-url`
2. **PDB Structure**: If `enzyme.pdbId` exists, load via `molecule-id`
3. **AlphaFold Prediction**: Use `enzyme.accession` with `alphafold-view="true"`

### Navigation Flow

All navigation through App.tsx. To add a view:
1. Add to `View` type union in [App.tsx](App.tsx)
2. Add case to `renderContent()` switch
3. Update [Navbar.tsx](components/Navbar.tsx) and [Footer.tsx](components/Footer.tsx)

### Database Schema

**Normalized design prevents redundancy:**
- `enzymes` table: Core data (1 row per enzyme)
- `identifiers` table: Multiple external IDs per enzyme
- `plastic_substrates` table: Many-to-many enzyme ↔ plastic relationships

**To query enzyme with all data:**
```python
# Main enzyme data
enzyme = cursor.execute('SELECT * FROM enzymes WHERE protein_id = ?', (id,)).fetchone()

# Plastic types
plastics = cursor.execute(
    'SELECT substrate_code FROM plastic_substrates WHERE enzyme_id = ?',
    (enzyme['id'],)
).fetchall()

# Primary PDB ID
pdb = cursor.execute(
    'SELECT identifier_value FROM identifiers WHERE enzyme_id = ? AND identifier_type = "pdb" LIMIT 1',
    (enzyme['id'],)
).fetchone()
```

## Database Initialization

The [init_db.py](init_db.py) script:
1. Parses PlaszymeDB_v1.1.csv (474 enzymes, 54 columns)
2. Creates normalized SQLite schema with indexes
3. Handles data transformations:
   - Converts 34 binary plastic columns → `plastic_substrates` junction table
   - Splits semicolon-delimited IDs → `identifiers` table rows
   - Calculates sequence length from sequence field
   - Generates S3 structure URLs (files not uploaded yet)
4. Validates data integrity and reports statistics

**Output:**
- `plaszyme.db` - SQLite database (~150KB)
- Import summary with enzyme/identifier/substrate counts
- Validation reports (plastic type distribution, missing data)

## Styling

Uses Tailwind CSS with custom gradients and animations. Background mesh gradient applied in App.tsx with fixed positioning. Component-specific styles use Tailwind utility classes.

## Future Integration Points

**Python Bioinformatics Models:**
Add endpoints to [backend/main.py](backend/main.py):
```python
@app.post("/api/predict")
async def predict_enzyme_activity(sequence: str):
    # Call your Python ML models here
    result = your_model.predict(sequence)
    return {"prediction": result}
```

**S3 Structure Files:**
Upload PDB files to S3 bucket:
- Pattern: `https://plaszyme-assets.s3.amazonaws.com/pdb_predicted/{accession}.pdb`
- URLs already generated in database `structure_url` field
- Configure S3 CORS for browser access from frontend domain
