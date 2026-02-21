# RePlaszyme

A comprehensive database and analysis platform for plastic-degrading enzymes with AI-powered sequence analysis, BLAST alignment, and 3D structure visualization.

## Features

- **Enzyme Database**: 474 curated plastic-degrading enzymes with complete sequence and structural data
- **3D Structure Visualization**: Interactive Molstar viewer supporting PDB, S3 custom structures, and AlphaFold predictions
- **BLAST Search**: Local Smith-Waterman sequence alignment with BLOSUM62 matrix
- **AI-Powered Analysis**: Multi-model protein sequence analysis for enzyme classification
- **Advanced Filtering**: Search and filter by plastic substrate type, organism, and more
- **Real-time Statistics**: Live database statistics from REST API

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19 + TypeScript + Vite 6 |
| Backend | FastAPI (Python) + SQLite |
| Visualization | Molstar (3D) + Nightingale Elements (sequence) |
| AI | Google Gemini / Custom Model |
| Styling | Tailwind CSS 4 |

## Prerequisites

- **Node.js** v18 or higher
- **Python** 3.8 or higher
- **pip3**

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/RePlaszyme.git
cd RePlaszyme
```

### Step 2: Initialize the Database

```bash
python3 init_db.py
```

This creates `plaszyme.db` from `PlaszymeDB_v1.1.csv` and imports 474 enzymes into a normalized SQLite schema.

### Step 3: Setup Backend

```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`.

### Step 4: Setup Frontend

```bash
# From project root
npm install
```

Create `.env.local` in the project root:

```bash
# Required
VITE_API_URL=http://localhost:8000

# Optional: AI Prediction
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_PRIVATE_MODEL_URL=https://your-model.com/api
```

Run the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`.

> **Note**: Both backend and frontend must be running for the application to work.

## Usage

### Browse Enzymes

Navigate to the **Browse** page to:
- Search enzymes by name, organism, or accession number
- Filter by plastic substrate type (PET, PE, PP, PS, PUR, PLA, PHB, etc.)
- Export filtered results
- Click on an enzyme to view details

### View Enzyme Details

Click on any enzyme to see:
- Complete sequence and metadata
- 3D structure visualization (Molstar)
- External database links (GenBank, UniProt, PDB)
- Optimal temperature and pH conditions

### BLAST Search

Navigate to the **BLAST** page to:
1. Paste a protein sequence (FASTA or raw format)
2. Configure search parameters:
   - Maximum results (10-500)
   - Similarity threshold (>30%, >50%, >70%, >90%)
   - Filter by plastic substrate type
   - Restrict to enzymes with known structures
3. Run alignment to find homologous sequences
4. Click on hits to view enzyme details

### AI Prediction

Navigate to the **Predictor** page to:
1. Paste a protein sequence
2. Get AI-powered predictions for:
   - Enzyme family classification
   - Plastic substrate specificity
   - Confidence score

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/enzymes` | Paginated enzyme list with filtering |
| GET | `/api/enzymes/{id}` | Single enzyme by protein ID |
| GET | `/api/enzymes/export` | Export all matching enzymes |
| POST | `/api/blast` | BLAST sequence alignment |
| GET | `/api/stats` | Database statistics |
| GET | `/api/metadata` | Database metadata and license |
| GET | `/health` | Health check endpoint |

### Example Requests

**Search enzymes:**
```bash
curl "http://localhost:8000/api/enzymes?search=PETase&plastic_types=PET&limit=10"
```

**BLAST alignment:**
```bash
curl -X POST "http://localhost:8000/api/blast" \
  -H "Content-Type: application/json" \
  -d '{"sequence": "MNFPRASRLMQ...", "max_results": 100, "similarity_threshold": "30"}'
```

## Project Structure

```
RePlaszyme/
├── backend/
│   ├── main.py                 # FastAPI REST API
│   ├── requirements.txt        # Python dependencies
│   └── services/
│       └── blast/              # BLAST alignment service
├── components/
│   ├── Browse.tsx              # Enzyme browsing
│   ├── Blast.tsx               # BLAST search interface
│   ├── Predictor.tsx           # AI prediction
│   ├── EnzymeDetail.tsx        # 3D structure viewer
│   └── ...
├── services/
│   ├── api/databaseService.ts  # API client
│   └── predictionService.ts    # AI prediction service
├── App.tsx                     # Main application
├── types.ts                    # TypeScript definitions
├── init_db.py                  # Database initialization
└── PlaszymeDB_v1.1.csv         # Raw enzyme data
```

## Database Schema

| Table | Description |
|-------|-------------|
| `enzymes` | Core enzyme data (474 records) |
| `identifiers` | External IDs (GenBank, PDB, UniProt) |
| `plastic_substrates` | Enzyme-plastic relationships |
| `substrate_types` | Reference data for substrates |

## Production Deployment

### Frontend Build

```bash
npm run build
npm run preview
```

### Backend Production

```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Development

For detailed development guidelines, architecture patterns, and coding conventions, see [CLAUDE.md](CLAUDE.md).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- Enzyme data sourced from PlaszymeDB v1.1
- 3D structure visualization powered by [Molstar](https://molstar.org/)
- Sequence visualization by [Nightingale Elements](https://ebi-webcomponents.github.io/nightingale/)
