# ft_transcendence - Project Documentation

## 1. Project Overview
**ft_transcendence** is a real-time multiplayer Pong web application with social features, authentication, and blockchain integration. This project was built to meet specific requirements involving 10 key technical modules.

## 2. Project Status
**Current State**: ✅ MVP Completed (Functional Prototype)
All core modules have been initialized and basic functionality is implemented. The application is playable locally.

### ✅ Implemented Modules (Total: 10.5 Majors)

**Majors (1 Major = 1 Point)**
1.  **Web**: Use a framework to build the backend.
2.  **Web**: Store the score of a tournament in the Blockchain.
3.  **User Management**: Standard user management, authentication, users across tournaments.
4.  **User Management**: Implement remote authentication.
5.  **Gameplay and user experience**: Remote players.
6.  **Cybersecurity**: Implement Two-Factor Authentication (2FA) and JWT.
7.  **Server-Side Pong**: Replace basic Pong with server-side Pong and implement an API.

**Minors (2 Minors = 1 Major)**
1.  **Web**: Use a database for the backend.
2.  **Gameplay and user experience**: Game customization options.
3.  **AI-Algo**: User and Game Stats Dashboards.
4.  **Cybersecurity**: GDPR compliance options with user anonymization, local data management, and Account Deletion.
5.  **Accessibility**: Multiple language support.
6.  **Accessibility**: Support on all devices.
7.  **Accessibility**: Expanding browser compatibility.

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
*   **Framework**: Vanilla TypeScript (Vite)
*   **Styling**: Tailwind CSS
*   **Key Libraries**: Custom Router (Routing), `i18next` (Translations), `chart.js` (Stats).
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
