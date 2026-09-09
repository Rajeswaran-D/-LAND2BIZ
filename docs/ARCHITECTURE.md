# LAND2BIZ Architecture

## Stack Lock
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui, React Leaflet, Recharts
- **Backend**: Python, FastAPI, Pydantic, SQLAlchemy, Alembic
- **Database**: PostgreSQL (Supabase-compatible)
- **AI**: Provider-agnostic abstraction (Gemini/Groq)
- **GIS**: OSM/Overpass (Google Places optional)
- **Documents**: ReportLab
- **Testing**: Pytest (backend) + Vitest (frontend)

## Architecture Style
**Modular Monolith**
The frontend is exclusively a presentation and orchestration client. The backend executes all authoritative logic.

## Error Handling
All exceptions use `Land2BizException` tracking:
`request_id`, `module`, `layer`, `error_type`
The frontend `apiClient` normalizes these responses for user display.

## Vertical Slice Rule
Modules M0-M21 are developed vertically. No module is "complete" unless its Backend, Database, AI-checks, API, and Frontend UI are fully connected and tested end-to-end.
