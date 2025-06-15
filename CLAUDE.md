# Zoldem Starter Project

A full-stack application with React frontend and Go backend.

## Project Objectives
- Develop a full poker software as an open-source project
- Project name: Zoldem

## Project Structure

```
zoldem-starter/
├── apps/
│   ├── client/                 # React + Vite frontend
│   │   ├── src/
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   └── server/                 # Go backend
│       ├── main.go
│       ├── go.mod
│       └── go.sum
├── Dockerfile.client
├── Dockerfile.server
├── docker-compose.yml
└── Makefile
```

## Commands

### Development
- `make dev` - Start both client and server in Docker
- `make dev-server` - Start only Go server (port 8080)
- `make dev-client` - Start only Vite frontend (port 5173)

### Build & Deploy
- `make build` - Build both containers
- `make stop` - Stop containers
- `make clean` - Remove containers, volumes, cache

### Utilities
- `make logs` - Tail docker logs
- `make tail-log` - Tail local dev.log file
- `make help` - Show available commands

### Client Commands
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Technology Stack

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS 4.1
- ESLint

### Backend
- Go 1.24
- Fiber web framework
- WebSocket support (gorilla/websocket)

## Essential Go Libraries

- **Web Framework**: `github.com/gofiber/fiber/v2`
- **WebSocket Support**: `github.com/gorilla/websocket`
- **Live Reload (Dev Only)**: `github.com/cosmtrek/air`
- **Configuration**: `github.com/joho/godotenv`
- **Logging**: `github.com/rs/zerolog`
- **Poker Hand Evaluator**: `georgyo/go-poker`
- **Testing**: `github.com/stretchr/testify`
- **Task Scheduling / Background Jobs**: `github.com/go-co-op/gocron`
- **Database**: PostgreSQL for storing user state and game state

## Development Rules

1. **Port Configuration**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:8080
   - API URL configured via VITE_API_URL environment variable

2. **Code Style**
   - Frontend: Use ESLint configuration
   - Follow existing TypeScript patterns
   - Use Tailwind for styling
   - Code must be readable - avoid shorthand writing that might confuse new contributors
   - Use descriptive variable names and clear function names
   - Prefer explicit code over clever abbreviations

3. **Development Workflow**
   - Use Docker containers for consistent environment
   - Hot reload enabled for both frontend and backend
   - Volume mounts for live code changes

4. **Logging & Debugging**
   - Project uses `logs/dev.log` for development logging
   - Use `make tail-log` to monitor logs in real-time
   - When developing features, add useful log messages for debugging
   - Include context like function names, input parameters, and error details
   - Always log anything using `make tail-log` command and store log file on local so you can debug any error message that happens inside docker

5. **Testing**
   - Run `npm run lint` for frontend code quality
   - Build both containers to verify integration

6. **File Permissions**
   - You are allowed to edit any files inside this project
   - Do not touch files outside this folder

7. **Git Workflow**
   - Main branch: `main`
   - Commit changes before building containers
   - When merging a feature branch, always rebase the feature branch with main first, resolve any conflicts, then safely merge to main and push to GitHub