# ft_transcendence - Project Documentation

## 1. Project Overview
**ft_transcendence** is a real-time multiplayer Pong web application with social features, authentication, and blockchain integration. This project was built to meet specific requirements involving 10 major technical modules.

## 2. Project Status
**Current State**: ✅ MVP Completed (Functional Prototype)
All core modules have been initialized and basic functionality is implemented. The application is playable locally.

### ✅ What is Already Done
The following 10 Major Modules have been implemented:

1.  **Web - Backend Framework**: Fastify (Node.js) with TypeScript.
2.  **Web - Frontend Framework**: React (Vite) + Tailwind CSS + TypeScript.
3.  **Web - Database**: SQLite (via `sqlite3` driver).
4.  **User Management - Standard**: User registration, login, and profile stats.
5.  **User Management - Remote Auth**: OAuth integration points (Architecture ready).
6.  **Gameplay - Remote Players**: Real-time WebSocket synchronization for remote play.
7.  **Cybersecurity - 2FA & JWT**: Two-Factor Authentication (OTP) and JSON Web Tokens for session security.
8.  **Web - Blockchain**: Smart Contract (Solidity) on Hardhat for score recording.
9.  **Server-Side Pong**: Game physics and state management run entirely on the backend to prevent cheating.
10. **Accessibility**: Responsive Design (Tailwind) and Internationalization (`i18next`).

### 🚧 What Needs to be Done (Future Roadmap)
While the core logical implementation is complete, the following areas require work for a production-ready application:

*   **UI/UX Polish**:
    *   Create dedicated Registration and Login forms (currently API-accessible).
    *   Build a User Profile page to view stats and history.
    *   Add navigation menus and authorized-only view protection.
*   **Blockchain Integration**:
    *   Connect the Backend `MatchModel` to the `ethers.js` service to *actually* write to the deployed smart contract (currently mocked).
*   **Game Features**:
    *   Add "Matchmaking" (currently simple queue).
    *   Implement "Private Lobbies" or "Invite Friend".
*   **Security hardening**:
    *   Add strict input validation (Zod/Joi).
    *   Implement rate limiting.

## 3. Architecture & Technology Stack

### Backend (`/backend`)
*   **Language**: TypeScript
*   **Framework**: Fastify
*   **Database**: SQLite (`db/transcendence.sqlite`)
*   **Key Libraries**: `@fastify/websocket` (Real-time), `@fastify/jwt` (Auth), `speakeasy` (2FA), `bcrypt` (Hashing).
*   **Entry Point**: `src/index.ts`
*   **Game Logic**: `src/game/pong.ts` (Physics engine)

### Frontend (`/frontend`)
*   **Language**: TypeScript
*   **Framework**: React (Vite)
*   **Styling**: Tailwind CSS
*   **Key Libraries**: `react-router-dom` (Routing), `i18next` (Translations), `chart.js` (Stats).
*   **Canvas**: `src/components/GameCanvas.tsx` (Rendering engine)

### Blockchain (`/blockchain`)
*   **Language**: Solidity
*   **Framework**: Hardhat
*   **Network**: Local Hardhat Network (simulating Avalanche/Ethereum).
*   **Contract**: `contracts/Score.sol`

## 4. Setup & Execution Guide

### Prerequisites
*   Node.js (v18+)
*   npm

### Quick Start (Local)
1.  **Start Backend**:
    ```bash
    cd backend
    npm install
    npm start
    ```
    *Runs on port 3000.*

2.  **Start Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    *Runs on port 5173.*

3.  **Start Blockchain Node** (Optional for now):
    ```bash
    cd blockchain
    npm install
    npx hardhat node
    ```
    *Runs on port 8545.*

## 5. API Reference (Basic)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user (`email`, `password`, `username`) |
| `POST` | `/api/auth/login` | Login and receive JWT (`email`, `password`) |
| `POST` | `/api/2fa/generate` | Generate 2FA secret and QR code |
| `GET` | `/api/users/me` | Get current user profile (Protected) |
| `GET` | `/api/users/:id/stats` | Get user statistics |
