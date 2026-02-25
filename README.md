# PM Copilot Workspace

AI-powered workspace for product managers to manage workspaces, epics, requirements, tasks, and generate PRDs with AI assistance.

## Features

- **Workspace Management**: Create and manage multiple workspaces
- **Epic Tracking**: Organize work into epics
- **Requirement Management**: Track and manage requirements
- **Task Management**: Kanban board and list views with drag-and-drop
- **AI Chat Integration**: Support for multiple AI providers
  - Anthropic Claude
  - OpenAI GPT
  - DeepSeek
  - GLM (Zhipu AI)
- **PRD Generation**: AI-powered product requirement document generation
- **User Authentication**: JWT-based authentication system

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy + SQLite
- JWT Authentication
- Pydantic

### Frontend
- React 18 + TypeScript
- Vite
- Redux Toolkit
- Tailwind CSS
- React Router

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 20+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment configuration
cp .env.example .env

# Update .env with your API keys
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - DEEPSEEK_API_KEY
# - GLM_API_KEY

# Initialize database (creates default admin account)
python -c "from app.db.init_db import init_db; init_db()"

# Run server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Default Account

A default administrator account is created automatically on database initialization:

- **Username**: `admin`
- **Email**: `admin@example.com`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user info

### Workspaces
- `GET /api/v1/workspaces` - List all workspaces
- `POST /api/v1/workspaces` - Create workspace
- `GET /api/v1/workspaces/{id}` - Get workspace
- `PUT /api/v1/workspaces/{id}` - Update workspace
- `DELETE /api/v1/workspaces/{id}` - Delete workspace

### Epics
- `GET /api/v1/epics` - List all epics
- `POST /api/v1/epics` - Create epic
- `GET /api/v1/epics/{id}` - Get epic
- `PUT /api/v1/epics/{id}` - Update epic
- `DELETE /api/v1/epics/{id}` - Delete epic

### Requirements
- `GET /api/v1/requirements` - List all requirements
- `POST /api/v1/requirements` - Create requirement
- `GET /api/v1/requirements/{id}` - Get requirement
- `PUT /api/v1/requirements/{id}` - Update requirement
- `DELETE /api/v1/requirements/{id}` - Delete requirement

### Tasks
- `GET /api/v1/tasks` - List all tasks (with filtering and sorting)
- `POST /api/v1/tasks` - Create task
- `GET /api/v1/tasks/{id}` - Get task
- `PUT /api/v1/tasks/{id}` - Update task
- `PATCH /api/v1/tasks/{id}/status` - Update task status
- `DELETE /api/v1/tasks/{id}` - Delete task

### Conversations (AI Chat)
- `GET /api/v1/conversations/models` - Get available AI models
- `POST /api/v1/conversations` - Create conversation
- `GET /api/v1/conversations/{id}` - Get conversation
- `POST /api/v1/conversations/{id}/chat` - Send message

### PRD (Product Requirements Document)
- `POST /api/v1/prds/generate` - Generate PRD with AI
- `GET /api/v1/prds/{id}` - Get PRD
- `PUT /api/v1/prds/{id}` - Update PRD
- `DELETE /api/v1/prds/{id}` - Delete PRD

## Environment Variables

See `.env.example` for all available configuration options:

```bash
# Application
APP_NAME=PM Copilot Workspace
DEBUG=True

# Database
DATABASE_URL=sqlite:///./pm_copilot.db

# Authentication
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI API Keys
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key
DEEPSEEK_API_KEY=your-deepseek-key
GLM_API_KEY=your-glm-key

# CORS
CORS_ORIGINS=["http://localhost:5173","http://localhost:3000"]
```

## Project Structure

```
pm-copilot-workspace/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/          # API endpoints
│   │   ├── core/            # Security utilities
│   │   ├── db/              # Database session and init
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # AI service integration
│   ├── .env                 # Environment configuration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── types/           # TypeScript types
│   └── package.json
└── README.md
```

## Development

### Backend Development

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

### Frontend Development

```bash
cd frontend
npm run dev
```

### Code Quality

```bash
# Backend
cd backend
flake8 app/
mypy app/

# Frontend
cd frontend
npm run lint
```

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

### Backend Deployment

1. Set environment variables
2. Install dependencies: `pip install -r requirements.txt`
3. Run database migrations
4. Start server: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend Deployment

1. Build: `npm run build`
2. Serve static files with nginx or similar

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
