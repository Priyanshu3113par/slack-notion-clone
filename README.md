# 🚀 Slack-Notion Clone

A production-grade **Real-Time SaaS Collaboration Workspace** inspired by **Slack** and **Notion**, built using the **MERN Stack**. The platform enables teams to communicate, collaborate, manage workspaces, organize documents, and track tasks in a unified environment.

---

## ✨ Features

### 🔐 Authentication
- User Registration & Login
- JWT Access & Refresh Token Authentication
- Secure Password Hashing using bcrypt
- Protected Routes
- Role-Based Access Control

### 🏢 Workspace Management
- Create, Update & Delete Workspaces
- Invite Members via Invite Code
- Join & Leave Workspaces
- Workspace Switching

### 💬 Channel Management
- Create, Edit & Delete Channels
- Organize Team Discussions
- Channel-based Communication

### ⚡ Real-Time Messaging
- Socket.IO Powered Live Chat
- Typing Indicators
- Online User Presence
- Persistent Message History

### 📄 Document Collaboration
- Create & Edit Workspace Documents
- Rich Document Management
- Organized Workspace Documentation

### ✅ Task Management
- Kanban Board
- Todo
- In Progress
- Review
- Completed
- Task Assignment

### 📁 File Management
- Upload Files
- Image Support
- Document Storage
- File Metadata Management

### ⚙ Backend Features
- RESTful API Architecture
- Express Middleware
- MongoDB with Mongoose
- Redis Session Caching
- Error Handling Middleware
- Environment Configuration
- Clean Architecture

---

# 🛠 Tech Stack

## Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router DOM
- TanStack Query
- Axios
- React Hook Form
- Socket.IO Client

---

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt
- Socket.IO
- Redis

---

## DevOps

- Docker
- Docker Compose
- GitHub Actions
- ESLint
- Prettier

---

# 📂 Project Structure

```
slack-notion-clone
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── layouts
│   │   ├── hooks
│   │   ├── contexts
│   │   ├── services
│   │   ├── types
│   │   └── utils
│   ├── public
│   ├── Dockerfile
│   └── package.json
│
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── services
│   │   ├── sockets
│   │   ├── utils
│   │   └── types
│   ├── Dockerfile
│   └── package.json
│
├── docs
├── .github/workflows
├── docker-compose.yml
├── README.md
└── package.json
```

---

# 🗄 Database Collections

- Users
- Workspaces
- Channels
- Messages
- Documents
- Tasks
- Files

---

# 🔌 REST API

## Authentication

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
GET  /api/auth/profile
```

---

## Workspaces

```
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PUT    /api/workspaces/:id
DELETE /api/workspaces/:id
POST   /api/workspaces/join
POST   /api/workspaces/:id/leave
```

---

## Channels

```
GET    /api/channels/workspace/:workspaceId
POST   /api/channels
GET    /api/channels/:id
PUT    /api/channels/:id
DELETE /api/channels/:id
```

---

## Messages

```
GET  /api/messages/channel/:channelId
POST /api/messages
```

---

## Documents

```
GET    /api/documents/workspace/:workspaceId
POST   /api/documents
GET    /api/documents/:id
PUT    /api/documents/:id
DELETE /api/documents/:id
```

---

## Tasks

```
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

---

# ⚙ Environment Variables

## Backend

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/saas-workspace
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
```

---

## Frontend

```env
VITE_API_URL=http://localhost:4000
```

---

# 🚀 Local Setup

## Clone Repository

```bash
git clone https://github.com/Priyanshu3113par/slack-notion-clone.git
cd slack-notion-clone
```

---

## Install Dependencies

```bash
npm run install-all
```

---

## Run Development

```bash
npm run dev
```

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:4000
```

---

# 🐳 Docker Deployment

Build and start all services

```bash
docker-compose up --build
```

Application

Frontend

```
http://localhost:5173
```

Backend

```
http://localhost:4000
```

---

# ☁ Deployment

## Frontend

- Vercel

## Backend

- Render

## Database

- MongoDB Atlas

## Cache

- Redis Cloud

---

# 📊 Development Timeline

### ✅ Week 1

- Project Architecture
- MERN Monorepo Setup
- Authentication
- JWT
- Login & Registration
- Landing Page
- Dashboard Setup

---

### ✅ Week 2

- MongoDB Models
- Workspace CRUD
- Channel CRUD
- Protected APIs
- Authentication Middleware
- REST API Development

---

### ✅ Week 3

- Socket.IO Integration
- Real-Time Messaging
- Online User Presence
- Typing Indicators
- Document Management
- Task Management
- File Upload Support

---

### ✅ Week 4

- Complete Frontend & Backend Integration
- MongoDB Integration
- Redis Integration
- Application Testing
- Bug Fixes & Performance Improvements
- Docker Configuration
- CI/CD Workflow
- Production Deployment
- Documentation & Final Review

---

# 📸 Screenshots

> Add application screenshots here after deployment.

- Landing Page
- Login
- Dashboard
- Workspace
- Chat
- Documents
- Tasks

---

# 📈 Future Enhancements

- Video Calling
- Screen Sharing
- Notifications
- AI Assistant
- Calendar Integration
- Third-party Integrations
- Mobile Application

---

# 👨‍💻 Author

**Priyanshu Parate**

B.Tech Electronics & Telecommunication Engineering

MIT Academy of Engineering

---

# 📄 License

