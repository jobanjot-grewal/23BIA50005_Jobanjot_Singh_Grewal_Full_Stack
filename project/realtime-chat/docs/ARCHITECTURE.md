# System Architecture

## High-Level Architecture
The application uses a standard 3-tier architecture:
1.  **Presentation Tier:** React SPA running in the user's browser.
2.  **Application Tier:** Node.js/Express backend server handling business logic.
3.  **Data Tier:** MongoDB database handling persistence.

## Component Interactions

### 1. HTTP/REST Flow
Used for standard CRUD operations (login, fetching history, updating profile).
*   Client -> Axios Request -> Nginx Reverse Proxy -> Express Router -> Express Controller -> Service Layer -> Mongoose Model -> MongoDB

### 2. WebSocket Flow
Used for real-time ephemeral data (typing, presence) and instant message delivery.
*   Client -> Socket.IO Emit -> Nginx Proxy (Upgrade header) -> Node.js Socket Handler.
*   If data needs persistence (e.g., a message), the Socket Handler calls the Service Layer to save to MongoDB before broadcasting the event to other connected clients in the room.

## Database Schema Diagram (Logical)

*   **User**
    *   _id, name, username, email, passwordHash, avatar, role, isBlocked, lastSeen
*   **Conversation**
    *   _id, type (direct/group), participants (Ref: User[]), lastMessage (Ref: Message), unreadCounts (Map)
*   **Message**
    *   _id, conversationId (Ref: Conversation), sender (Ref: User), text, status, readBy (Ref: User[])

## Directory Structure
*   `client/`: React frontend, structured by feature slices (Redux) and pages.
*   `server/`: Express backend, structured using the Controller-Service-Model pattern.

## Deployment Architecture
*   Containerized using Docker.
*   `docker-compose` orchestrates 3 containers:
    1.  `mongo`: Official MongoDB image.
    2.  `server`: Node.js image running the backend on port 5000.
    3.  `client`: Multi-stage build that compiles React and serves the static files using Nginx on port 80. Nginx also reverse-proxies `/api` and `/socket.io` requests to the `server` container.
