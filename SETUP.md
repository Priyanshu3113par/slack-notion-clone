# Complete Setup Guide

## Prerequisites
- Node.js 18+ (Check: `node --version`)
- npm 9+ (Check: `npm --version`)
- MongoDB running locally or via Docker
- Redis running locally or via Docker

## Step 1: Install Dependencies

### Option A: Quick Install
```bash
cd p:\saas-workspace
npm run install-all
```

### Option B: Manual Install
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

## Step 2: Configure Environment Variables

Files are already created:
- `server/.env` - Backend configuration
- `client/.env` - Frontend configuration

These are configured for local development. Update if needed.

## Step 3: Start MongoDB & Redis

### Option A: Local Installation
```bash
# MongoDB (requires MongoDB to be installed)
mongod

# Redis (requires Redis to be installed)
redis-server
```

### Option B: Docker
```bash
# Start only MongoDB and Redis
docker-compose up -d mongodb redis
```

## Step 4: Start the Application

### Option A: Development Mode (Both Apps)
```bash
cd p:\saas-workspace
npm run dev
```

This will start:
- Backend on `http://localhost:4000`
- Frontend on `http://localhost:5173`

### Option B: Individual Startup
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev
```

### Option C: Docker Compose
```bash
cd p:\saas-workspace
docker-compose up
```

## Step 5: Test the Application

1. Open `http://localhost:5173` in your browser
2. Register a new account with an email and password
3. Create a workspace
4. Create channels in the workspace
5. Click on a channel to open chat
6. Send messages and see real-time updates

## Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Ensure MongoDB is running: `mongod` or `docker-compose up -d mongodb`
- Check connection string in `server/.env`
- Default: `mongodb://localhost:27017/saas-collab`

### Issue: "Cannot connect to Redis"
**Solution:**
- Ensure Redis is running: `redis-server` or `docker-compose up -d redis`
- Check Redis URL in `server/.env`
- Default: `redis://localhost:6379`

### Issue: "Port 4000 is already in use"
**Solution:**
```bash
# Kill process on port 4000
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:4000 | xargs kill -9
```

### Issue: "CORS error in frontend"
**Solution:**
- Ensure backend is running on `http://localhost:4000`
- Check vite.config.ts proxy settings
- Verify `VITE_API_URL=http://localhost:4000` in `client/.env`

### Issue: "Socket.IO connection fails"
**Solution:**
- Backend must be running for Socket.IO to work
- Check `useSocket.ts` for connection URL
- Verify CORS settings in `server/src/services/socketService.ts`

### Issue: "Authentication/Login fails"
**Solution:**
- Verify MongoDB is running and accessible
- Check JWT_SECRET in `server/.env`
- Clear browser localStorage and try again
- Check server logs for error details

## API Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get workspaces (replace TOKEN with actual token)
curl -X GET http://localhost:4000/api/workspaces \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman
1. Import API endpoints from `server/src/routes/`
2. Set Authorization header: `Bearer <access_token>`
3. Test all CRUD operations

## Production Build

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
npm preview
```

## Database Seeding (Optional)

To add test data to MongoDB:
```bash
# Create sample workspace, channels, messages
# Use MongoDB UI or shell:
mongo saas-collab
```

## Logs and Debugging

### Backend Logs
- Check console output from `npm run dev`
- Logs directed to stdout with morgan middleware

### Frontend Logs
- Open browser DevTools (F12)
- Check Console and Network tabs
- Check React DevTools

### Docker Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Project Structure Reference

```
saas-workspace/
├── server/
│   ├── src/
│   │   ├── controllers/      # API handlers
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Socket.IO, tokens, Redis
│   │   ├── middleware/       # Auth, error handling
│   │   ├── config/           # Env, Redis, database
│   │   └── utils/            # Logger, error handler
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── hooks/            # Socket.IO hooks
│   │   ├── services/         # API calls
│   │   ├── contexts/         # React Context
│   │   └── types/            # TypeScript types
│   └── package.json
├── docker-compose.yml        # Service orchestration
└── .github/workflows/        # CI/CD pipelines
```

## Next Steps

1. ✅ All dependencies installed
2. ✅ Databases configured
3. ✅ Application running
4. Next: Test workspace creation → Channel creation → Real-time chat

## Support

For issues:
1. Check this troubleshooting guide
2. Review server/client logs
3. Verify all services are running
4. Check `.env` configuration files
5. Ensure ports 4000 and 5173 are available

## Development Tips

- Use VS Code REST Client extension for API testing
- Enable Redux DevTools for better debugging
- Use Socket.IO DevTools for real-time event debugging
- Keep backend and frontend terminals visible
- Use `npm run dev` for hot reload on code changes
