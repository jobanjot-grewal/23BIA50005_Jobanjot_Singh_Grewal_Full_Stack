# Real-Time Messaging Platform

A complete, production-quality real-time messaging web application featuring secure authentication, live chat, presence tracking, and an admin dashboard. Built as a full-stack college final-year project.

## Features

* **User Authentication:** Secure JWT-based login/registration with bcrypt hashing.
* **Real-Time Messaging:** Instant message delivery powered by Socket.IO.
* **Chat Features:** One-to-one and group conversations, typing indicators, online presence, read receipts.
* **Admin Dashboard:** Monitor platform analytics, view users, and block/unblock accounts.
* **Modern UI/UX:** Clean, iMessage-inspired interface built with Tailwind CSS and React.
* **DevOps Ready:** Fully Dockerized with `docker-compose` and GitHub Actions CI workflow.

## Technology Stack

* **Frontend:** React, Vite, Redux Toolkit, React Router, Tailwind CSS, Socket.IO Client
* **Backend:** Node.js, Express, MongoDB, Mongoose, Socket.IO, JWT, Multer
* **Testing:** Jest, Supertest, MongoDB Memory Server
* **Deployment:** Docker, Nginx (for serving React)

## Local Setup

### Prerequisites
* Node.js v18+
* MongoDB running locally on port 27017, or Docker installed.

### 1. Clone & Configure
```bash
git clone <your-repo-url>
cd realtime-chat
cp .env.example .env
# Edit .env to add your JWT secret and MongoDB URI if different
```

### 2. Running without Docker
**Server:**
```bash
cd server
npm install
npm run dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

### 3. Running with Docker Compose
To spin up the entire stack (MongoDB, Backend Server, Nginx serving React Client):
```bash
docker-compose up --build
```
* App available at `http://localhost:3000`
* API available at `http://localhost:5000`

## Testing
To run the automated API integration tests:
```bash
cd server
npm test
```

## Documentation
Additional project documentation for college submissions is located in the `docs/` folder:
* `SYNOPSIS.md`: Degree-level project synopsis
* `SRS.md`: Software Requirements Specification
* `ARCHITECTURE.md`: System Architecture details
* `API.md`: API Endpoints and schemas

## Viva Demonstration Notes
1. Open two separate browsers (e.g., Chrome and Firefox) to demonstrate real-time WebSocket communication.
2. Register User A in Browser 1 and User B in Browser 2.
3. Show the real-time search functionality.
4. Start a chat. Demonstrate the typing indicators working live.
5. Send a message and show the instant delivery and read receipts (the double check marks).
6. Manually change a user's role to 'admin' in the MongoDB database, then login and show the Admin Dashboard.
