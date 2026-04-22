# Software Requirements Specification (SRS)

## 1. Introduction
This document specifies the software requirements for the Real-Time Messaging Platform. It defines the functional and non-functional requirements, user roles, and core use cases.

## 2. User Roles
1.  **Guest:** Unauthenticated user. Can only view the login and registration pages.
2.  **Authenticated User:** A registered user. Can search for others, send/receive messages, update profile, and manage their chats.
3.  **Administrator:** A privileged user. Has access to all Authenticated User features, plus a dashboard to view system analytics and moderate (block/unblock) users.

## 3. Functional Requirements

### 3.1 Authentication & Authorization
*   **REQ-AUTH-01:** The system shall allow users to register with a name, username, email, and password.
*   **REQ-AUTH-02:** The system shall hash passwords using bcrypt before database storage.
*   **REQ-AUTH-03:** The system shall issue a JWT upon successful login.
*   **REQ-AUTH-04:** The system shall protect private routes and API endpoints using the JWT.

### 3.2 User Management
*   **REQ-USR-01:** The system shall allow users to update their profile (bio, name, username).
*   **REQ-USR-02:** The system shall allow users to search for other non-blocked users by username, name, or email.
*   **REQ-USR-03:** The system shall track and display the last seen timestamp of users.

### 3.3 Messaging
*   **REQ-MSG-01:** The system shall allow users to create one-to-one conversations.
*   **REQ-MSG-02:** The system shall allow users to create group conversations with multiple participants.
*   **REQ-MSG-03:** The system shall transmit messages in real-time between online users using WebSockets.
*   **REQ-MSG-04:** The system shall persist all messages in the database for offline retrieval.
*   **REQ-MSG-05:** The system shall display read receipts when a message has been viewed by the recipient.
*   **REQ-MSG-06:** The system shall broadcast a typing indicator when a user is actively typing.

### 3.4 Administration
*   **REQ-ADM-01:** The system shall provide an admin dashboard displaying total users, active users, and message counts.
*   **REQ-ADM-02:** The system shall allow administrators to block users, preventing them from logging in or sending messages.

## 4. Non-Functional Requirements

### 4.1 Performance & Scalability
*   **NFR-PERF-01:** Real-time messages should be delivered with less than 200ms latency under normal network conditions.
*   **NFR-SCALE-01:** The backend architecture must be stateless (except for WebSocket connections) to allow horizontal scaling.

### 4.2 Security
*   **NFR-SEC-01:** API endpoints must implement rate limiting to prevent brute-force and DDoS attacks.
*   **NFR-SEC-02:** Sensitive configuration data (secrets, database URIs) must be injected via environment variables.

### 4.3 Usability
*   **NFR-UX-01:** The frontend interface must be fully responsive and optimized for both mobile and desktop resolutions.

## 5. Primary Use Cases
*   **UC1: Start a Chat:** User searches for a contact, clicks their name, and a new WebSocket room is joined.
*   **UC2: Send Message:** User types in the input box (triggering typing events), hits send, the message is saved to MongoDB, and emitted to the room.
*   **UC3: Moderate Platform:** Admin logs in, navigates to `/admin`, views analytics, and clicks 'Block' on an abusive user.
