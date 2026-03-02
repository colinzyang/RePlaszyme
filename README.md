[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?logo=python)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)

# RePlaszyme

A comprehensive database and analysis platform for **plastic-degrading enzymes** with AI-powered sequence analysis, BLAST alignment, and 3D structure visualization.

**Live Demo**: https://plaszyme.org

## Features

- **474 Curated Enzymes** - Comprehensive database with sequence, structure, and metadata
- **3D Visualization** - Interactive Molstar viewer with PDB and AlphaFold support
- **BLAST Search** - Local Smith-Waterman alignment with BLOSUM62 matrix
- **AI Prediction** - Multi-model protein analysis (Gemini / Custom Model)
- **Advanced Filtering** - Search by substrate type, organism, and more

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+

### Installation

```bash
# Clone repository
git clone https://github.com/Tsutayaaa/RePlaszyme.git
cd RePlaszyme

# Initialize database
python3 init_db.py

# Setup backend
cd backend && pip3 install -r requirements.txt
python3 -m uvicorn main:app --reload --port 8000

# Setup frontend (new terminal)
cd .. && npm install
npm run dev
```

Open http://localhost:3000

### Environment Variables

Create `.env.local` in project root:

```bash
VITE_API_URL=http://localhost:8000              # Required
VITE_GEMINI_API_KEY=your_key_here               # Optional: AI predictions
```

## Tech Stack

| Frontend | Backend | Visualization |
|----------|---------|---------------|
| React 19 + TypeScript | FastAPI + SQLite | Molstar (3D) |
| Vite 6 | Pydantic | AlphaFold DB |
| Tailwind CSS 4 | BioPython | |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/enzymes` | Paginated enzyme list |
| `GET` | `/api/enzymes/{id}` | Single enzyme details |
| `POST` | `/api/blast` | Sequence alignment |
| `GET` | `/api/stats` | Database statistics |

## Project Structure

```
RePlaszyme/
├── backend/           # FastAPI REST API
│   ├── main.py
│   └── services/blast/
├── components/        # React components
├── services/          # API & AI services
├── App.tsx            # Main application
└── PlaszymeDB_v1.1.csv
```

## License

[MIT](LICENSE)

## Acknowledgments

- Enzyme data from [PlaszymeDB](https://github.com/Tsutayaaa/PlaszymeDB)
- 3D visualization by [Molstar](https://molstar.org/)
- Phylogenetic trees by [iTOL](https://itol.embl.de/)
