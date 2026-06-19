# Slack-Notion Clone

A production-grade MERN SaaS collaboration workspace inspired by Slack and Notion with real-time messaging, workspace management, and document collaboration.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router, TanStack Query, Socket.IO
- **Backend**: Node.js, Express, TypeScript, MongoDB, Redis, Socket.IO
- **DevOps**: Docker, GitHub Actions CI/CD

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB (local or Docker)
- Redis (local or Docker)
- npm or yarn

### Option 1: Local development

```bash
cd p:\saas-workspace

# Install dependencies
npm run install-all

# Start both backend and frontend
npm run dev
```

Backend runs on `http://localhost:4000`  
Frontend runs on `http://localhost:5173`

### Option 2: Docker Compose

```bash
docker-compose up -d
```

Access:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/health`

## Project structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom hooks (Socket.IO, queries)
│   │   ├── services/      # API and business logic
│   │   ├── contexts/      # React contexts
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
│
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── routes/        # API routes
│   │   ├── models/        # MongoDB schemas
│   │   ├── middleware/    # Auth, error handling
│   │   ├── services/      # Business logic (Socket.IO, Redis)
│   │   ├── config/        # Environment, Redis, database
│   │   └── types/         # TypeScript definitions
│   ├── Dockerfile
│   └── package.json
│
├── docs/                  # Documentation
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Local dev environment
└── README.md
```

## Features

### Authentication
- User registration and login
- JWT access + refresh tokens
- bcrypt password hashing

### Workspace Management
- Create and manage workspaces
- Invite users with codes
- Join and leave workspaces

### Channels
- Create channels within workspaces
- Channel management (edit, delete)
- Real-time message history

### Real-time Chat
- Live messaging with Socket.IO
- Typing indicators
- Online user presence tracking
- Message persistence

### Documents
- Create workspace documents
- Edit and manage content
- Document history

### Tasks
- Kanban-style task board
- Status tracking (todo, in-progress, review, completed)
- Task assignment

### Redis Integration
- Session caching
- Online user tracking
- Scalable Socket.IO adapter

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token

### Workspaces
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/:id` - Get workspace
- `PUT /api/workspaces/:id` - Update workspace
- `DELETE /api/workspaces/:id` - Delete workspace
- `POST /api/workspaces/join` - Join workspace by code
- `POST /api/workspaces/:id/leave` - Leave workspace

### Channels
- `GET /api/channels/workspace/:workspaceId` - List channels
- `POST /api/channels` - Create channel
- `GET /api/channels/:id` - Get channel
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

### Messages
- `GET /api/messages/channel/:channelId` - Get channel messages
- `POST /api/messages` - Send message

### Documents
- `GET /api/documents/workspace/:workspaceId` - List documents
- `POST /api/documents` - Create document
- `GET /api/documents/:id` - Get document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

## Environment variables

### Backend (.env)

```
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/saas-collab
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:4000
```

## Development workflow

### Week 1: Authentication & Setup
- ✅ Project scaffolding
- ✅ User authentication (register, login, JWT)
- ✅ Professional UI (landing, login, register)
- ✅ Dashboard placeholder

### Week 2: Workspace & Channels
- ✅ Workspace CRUD APIs
- ✅ Channel CRUD APIs
- ✅ Workspace switcher UI
- ✅ Channel list UI

### Week 3: Real-time Chat
- ✅ Socket.IO integration
- ✅ Real-time messaging
- ✅ Typing indicators
- ✅ Online user tracking

### Week 4: Redis & Deployment
- ✅ Redis session caching
- ✅ Docker containerization
- ✅ GitHub Actions CI/CD
- ✅ Production-ready configuration

## Testing

```bash
# Backend
cd server
npm run build
npm start

# Frontend
cd client
npm run build
npm preview
```

## Contributing

Follow the existing code structure and TypeScript conventions. Ensure all changes are tested before submitting.

## License

MIT
