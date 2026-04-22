# API Documentation

Base URL: `/api`

## Authentication
*   **POST** `/auth/register`
    *   Body: `{ name, username, email, password }`
    *   Response: `{ success: true, data: { user, token } }`
*   **POST** `/auth/login`
    *   Body: `{ email, password }`
    *   Response: `{ success: true, data: { user, token } }`
*   **GET** `/auth/me` (Protected)
    *   Response: `{ success: true, data: { user } }`

## Users
*   **GET** `/users/search?q={query}` (Protected)
    *   Response: `{ success: true, data: { users: [...] } }`
*   **GET** `/users/:id` (Protected)
    *   Response: `{ success: true, data: { user } }`
*   **PUT** `/users/profile` (Protected)
    *   Body: `{ name, bio, username }`
    *   Response: `{ success: true, data: { user } }`

## Conversations
*   **POST** `/conversations` (Protected)
    *   Body: `{ participantId, type, groupName, participants }`
    *   Response: `{ success: true, data: { conversation } }`
*   **GET** `/conversations` (Protected)
    *   Response: `{ success: true, data: { conversations: [...] } }`

## Messages
*   **POST** `/messages` (Protected)
    *   Body (Multipart/Form-Data): `conversationId`, `text`, `attachments[]`
    *   Response: `{ success: true, data: { message } }`
*   **GET** `/messages/:conversationId?page=1&limit=50` (Protected)
    *   Response: `{ success: true, data: { messages: [...], total, page, pages } }`
*   **PUT** `/messages/:conversationId/read` (Protected)
    *   Response: `{ success: true, message: "Messages marked as read" }`

## Admin
*   **GET** `/admin/analytics` (Protected, Admin Only)
    *   Response: `{ success: true, data: { analytics: { totalUsers, activeUsers, totalMessages, blockedUsers } } }`
*   **GET** `/admin/users` (Protected, Admin Only)
    *   Response: `{ success: true, data: { users: [...] } }`
*   **PUT** `/admin/users/:id/block` (Protected, Admin Only)
*   **PUT** `/admin/users/:id/unblock` (Protected, Admin Only)
