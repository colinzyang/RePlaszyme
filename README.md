<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# RePlaszyme

A full-stack web application for plastic-degrading enzymes with AI-powered sequence analysis and 3D structure visualization.

## License

This project and its database are licensed under the [MIT License](LICENSE).

## Overview

RePlaszyme is a comprehensive database and analysis platform for plastic-degrading enzymes, featuring:

- **474 Enzymes**: Curated from PlaszymeDB_v1.1 with complete sequence and structural data
- **3D Structure Visualization**: Interactive Molstar viewer with support for PDB, S3, and AlphaFold structures
- **AI-Powered Analysis**: Multi-model protein sequence analysis (Gemini AI with fallback)
- **Advanced Filtering**: Search and filter enzymes by plastic type, organism, and more
- **Real-time Statistics**: Live database statistics fetched from backend API

## Tech Stack

- **Frontend**: React 19.2.4 + TypeScript + Vite 6.2.0
- **Backend**: FastAPI (Python) + SQLite
- **Visualization**: Molstar 5.6.1 (3D structures) + Nightingale Elements (sequence view)
- **AI Integration**: Google Gemini AI with multi-model fallback
- **Styling**: Tailwind CSS 4.1.18

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- pip3

## Quick Start

### 1. Database Initialization

```bash
python3 init_db.py
# Creates plaszyme.db from PlaszymeDB_v1.1.csv
# Imports 474 enzymes into normalized SQLite schema
```

### 2. Backend Setup

```bash
cd backend
pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
npm install
```

Create `.env.local` in the project root:

```bash
VITE_API_URL=http://localhost:8000
VITE_GEMINI_API_KEY=your_gemini_api_key_here        # Optional: For AI predictions
VITE_PRIVATE_MODEL_URL=https://your-model.com/api   # Optional: Custom model endpoint
```

Run the frontend:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

**Note**: Both backend and frontend must be running for the app to work.

## Project Structure

```
RePlaszyme/
├── backend/                 # FastAPI backend
│   ├── main.py             # REST API endpoints
│   └── requirements.txt    # Python dependencies
├── components/              # React components
│   ├── Browse.tsx          # Enzyme browsing with pagination
│   ├── EnzymeDetail.tsx    # 3D structure viewer
│   ├── Predictor.tsx       # AI sequence analysis
│   ├── StatsCards.tsx      # Database statistics
│   └── ...                 # Other UI components
├── services/
│   ├── api/
│   │   └── databaseService.ts   # API client for backend
│   └── predictionService.ts     # Multi-model AI prediction
├── App.tsx                 # Main app component
├── types.ts                # TypeScript type definitions
├── constants.ts            # Static data (timeline events)
├── init_db.py              # Database initialization script
├── PlaszymeDB_v1.1.csv    # Raw enzyme data
└── vite.config.ts          # Vite configuration
```

## API Endpoints

### Get Enzymes (with pagination and filtering)

```http
GET /api/enzymes?page=1&limit=10&search=PETase&plastic_types=PET
```

### Get Enzyme by ID

```http
GET /api/enzymes/{protein_id}
```

### Export Enzymes

```http
GET /api/enzymes/export?search=PETase&plastic_types=PET
```

### Get Database Statistics

```http
GET /api/stats
```

### Get Database Metadata (including license)

```http
GET /api/metadata
```

Returns database name, version, license (MIT), and other metadata.

## Features

### Browse Enzymes
- Paginated enzyme listing with up to 100 items per page
- Search by name, organism, or accession
- Filter by plastic substrate type (PET, PE, PP, PS, PUR, PLA, PHB, and more)
- Export filtered results

### Enzyme Details
- 3D structure visualization with multiple sources:
  - S3 custom structures
  - PDB entries
  - AlphaFold predictions
- Residue interaction tracking (hover/click)
- Screenshot export functionality

### AI Prediction
- Multi-model protein sequence analysis
- Automatic fallback (Private Model → Gemini → Mock)
- Enzyme family and substrate prediction
- Confidence scoring

## Development

### Build for Production

```bash
npm run build
npm run preview
```

### Backend Production

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## Database Schema

The database uses a normalized schema with four tables:

- `enzymes` - Core enzyme data (474 records)
- `identifiers` - External database IDs (GenBank, PDB, UniProt)
- `plastic_substrates` - Many-to-many enzyme-plastic relationships
- `substrate_types` - Reference data for plastic substrates

## License

See LICENSE file for details.

## Contributing

Contributions are welcome! Please read CLAUDE.md for development guidelines.
