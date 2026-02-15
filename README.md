# RandomChat - Real-Time Video Chat Platform (Bondra)

A full-stack web application for random video, audio, and text chat with strangers. Built with modern technologies for real-time communication and scalable architecture.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Overview

RandomChat is a production-ready chat application that enables users to connect with strangers worldwide through video, audio, or text communication. The platform features a robust matching algorithm, friend system, guest mode, and real-time messaging capabilities.

### Key Highlights

- Real-time video and audio communication using WebRTC
- Socket.IO-based instant messaging
- Smart matching algorithm with queue management
- Friend system with online presence
- Guest mode for anonymous chatting
- Secure authentication with JWT
- Responsive design for mobile and desktop
- Scalable microservices architecture

## Features

### Core Functionality

- **Multiple Chat Modes**: Video, audio, and text-only chat options
- **Random Matching**: Intelligent algorithm to match users based on preferences
- **Guest Access**: Chat without creating an account
- **Friend System**: Add friends and see when they're online
- **User Profiles**: Customizable profiles with avatars and bio
- **Real-time Messaging**: Instant message delivery with typing indicators
- **Session Management**: Automatic reconnection and session recovery
- **Reporting System**: Report inappropriate behavior
- **Queue Statistics**: Real-time queue position and estimated wait time

### Security & Privacy

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting and DDoS protection
- Input validation and sanitization
- CORS protection
- Secure WebSocket connections

### User Experience

- Dark theme optimized UI
- Responsive design (mobile, tablet, desktop)
- Smooth animations and transitions
- Loading states and error handling
- Browser notification support
- Typing indicators
- Message reactions

## Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **WebRTC**: Native WebRTC APIs
- **Real-time**: Socket.IO Client
- **HTTP Client**: Fetch API

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14
- **Cache**: Redis 7
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **ORM**: Prisma (optional) or raw SQL

### DevOps & Infrastructure

- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: Railway PostgreSQL
- **Cache**: Railway Redis
- **Version Control**: Git & GitHub
- **CI/CD**: GitHub Actions (optional)

## Architecture

### System Design

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client    │────────▶│   Vercel    │────────▶│   Railway   │
│  (Browser)  │◀────────│  (Frontend) │◀────────│  (Backend)  │
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
                                                       ▼
                                            ┌──────────────────┐
                                            │   PostgreSQL     │
                                            │   Redis Cache    │
                                            └──────────────────┘
```

### Communication Flow

1. **HTTP/REST**: Authentication, user management, friend operations
2. **WebSocket**: Real-time messaging, presence updates, notifications
3. **WebRTC**: Peer-to-peer video and audio streams

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL 14+ (for local development)
- Redis 7+ (for local development)
- Modern web browser with WebRTC support

### Quick Start

```bash
# Clone the repository
git clone https://github.com/gouravgangwardev/back.git
cd back

# Install dependencies for both frontend and backend
cd backend && npm install
cd ../frontend && npm install

# Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start backend (from backend directory)
cd backend
npm run dev

# Start frontend (from frontend directory, new terminal)
cd frontend
npm run dev
```

Access the application at http://localhost:5173

## Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup database
createdb randomchat
npm run db:migrate
npm run db:seed  # Optional: seed sample data

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/randomchat

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=30d

# CORS
FRONTEND_URL=http://localhost:5173

# Session
SESSION_SECRET=your-session-secret-here

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api/v1
VITE_SOCKET_URL=http://localhost:3000

# App Configuration
VITE_APP_NAME=RandomChat
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_GUEST_MODE=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_VIDEO_CHAT=true
VITE_ENABLE_AUDIO_CHAT=true
VITE_ENABLE_TEXT_CHAT=true
```

## Development

### Available Scripts

#### Backend

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run db:migrate   # Run database migrations
npm run db:seed      # Seed database
```

#### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

### Code Style

This project follows standard TypeScript and React best practices:

- ESLint for linting
- Prettier for code formatting
- TypeScript strict mode enabled
- Functional components with hooks
- Custom hooks for business logic
- Centralized state management

### Testing

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

## Deployment

### Frontend Deployment (Vercel)

#### Using Vercel CLI

```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Using Vercel Dashboard

1. Connect GitHub repository
2. Configure build settings:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Add environment variables
4. Deploy

### Backend Deployment (Railway)

#### Using Railway CLI

```bash
cd backend

# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Add Redis
railway add --plugin redis

# Deploy
railway up
```

#### Using Railway Dashboard

1. Create new project
2. Connect GitHub repository
3. Add PostgreSQL database
4. Add Redis cache
5. Configure environment variables
6. Deploy from GitHub

### Environment Variables in Production

#### Vercel (Frontend)

Set in Settings > Environment Variables:

```
VITE_API_URL=https://your-backend.railway.app/api/v1
VITE_SOCKET_URL=https://your-backend.railway.app
```

#### Railway (Backend)

Set in Variables tab:

```
NODE_ENV=production
DATABASE_URL=<provided-by-railway>
REDIS_URL=<provided-by-railway>
JWT_SECRET=<generate-secure-secret>
FRONTEND_URL=https://your-app.vercel.app
```

## API Documentation

### Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string"
  },
  "accessToken": "string",
  "refreshToken": "string"
}
```

#### POST /api/v1/auth/login
Login with existing credentials.

#### POST /api/v1/auth/guest
Login as guest user.

#### POST /api/v1/auth/refresh
Refresh access token.

#### POST /api/v1/auth/logout
Logout and invalidate tokens.

### User Endpoints

#### GET /api/v1/users/me
Get current user profile.

#### PATCH /api/v1/users/me
Update user profile.

#### POST /api/v1/users/me/avatar
Upload user avatar.

### Friends Endpoints

#### GET /api/v1/friends
Get user's friends list.

#### POST /api/v1/friends/requests
Send friend request.

#### POST /api/v1/friends/requests/:id/accept
Accept friend request.

#### DELETE /api/v1/friends/:id
Remove friend.

### Chat Endpoints

#### GET /api/v1/chat/queue-stats
Get current queue statistics.

#### POST /api/v1/chat/report
Report a user.

### Socket Events

#### Client to Server

- `matching:join-queue` - Join matching queue
- `matching:leave-queue` - Leave matching queue
- `chat:send-message` - Send message
- `chat:typing` - Send typing indicator
- `chat:skip` - Skip current partner
- `chat:end-session` - End chat session

#### Server to Client

- `matching:matched` - Match found
- `matching:queue-update` - Queue position update
- `chat:message` - Incoming message
- `chat:typing` - Partner typing
- `chat:partner-disconnected` - Partner left
- `presence:online-count` - Online users count

For complete API documentation, see [API.md](./docs/API.md)

## Project Structure

```
back/
├── backend/                    # Backend Node.js application
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   ├── socket/            # Socket.IO handlers
│   │   ├── utils/             # Utility functions
│   │   └── index.ts           # Application entry point
│   ├── prisma/                # Database schema
│   ├── tests/                 # Test files
│   ├── .env.example           # Environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend React application
│   ├── public/                # Static files
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── common/        # Reusable components
│   │   │   ├── chat/          # Chat components
│   │   │   ├── friends/       # Friend components
│   │   │   ├── matching/      # Matching components
│   │   │   └── layout/        # Layout components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API services
│   │   ├── context/           # React Context
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── styles/            # Global styles
│   │   ├── App.tsx            # Main app component
│   │   └── main.tsx           # Application entry
│   ├── index.html
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── docs/                       # Documentation
├── .gitignore
└── README.md
```

## Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Write or update tests
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature`
7. Submit a pull request

### Commit Message Convention

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build process or auxiliary tool changes

Example: `feat: add video chat toggle button`

### Code Review Process

1. All code must pass CI checks
2. At least one approval required
3. All comments must be resolved
4. Branch must be up to date with main

## License

MIT License

Copyright (c) 2024 Gourav Gangwar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Support

For support, email gouravgangwar.dev@gmail.com or open an issue on GitHub.

## Acknowledgments

- Socket.IO for real-time communication
- WebRTC for peer-to-peer connections
- Vercel for frontend hosting
- Railway for backend hosting
- The open-source community

## Roadmap

### Version 1.1
- [ ] Group video chat (3-4 participants)
- [ ] Screen sharing
- [ ] Chat history persistence
- [ ] User blocking system
- [ ] Advanced filters (location, interests)

### Version 1.2
- [ ] Mobile apps (React Native)
- [ ] End-to-end encryption
- [ ] AI moderation
- [ ] Language translation
- [ ] Virtual backgrounds

### Version 2.0
- [ ] Monetization features
- [ ] Premium subscriptions
- [ ] Virtual gifts
- [ ] Analytics dashboard
- [ ] Admin panel

## Project Status

Current Version: 1.0.0

Status: Production Ready

Last Updated: February 2024

---

Built with modern web technologies by Gourav Gangwar
