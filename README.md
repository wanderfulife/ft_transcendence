# ft_transcendence

A real-time multiplayer Pong game with social features, authentication, and blockchain integration.

## Features
- **Real-time Multiplayer Pong**: Play against remote players with live synchronization.
- **Power-ups**: Random power-ups (Speed, Size) spawn during the game.
- **User Management**: Register, Login, 2FA (Google Authenticator), Profile Stats.
- **Blockchain**: Match scores are recorded on the Ethereum/Avalanche blockchain (simulated via Hardhat).
- **Chat**: (Planned/Implemented) Real-time chat.
- **Security**: JWT Authentication, Password Hashing.

## Prerequisites
- **Docker**: Must be installed and running.
- **Node.js**: (Optional) v18+ for local development without Docker.

## Quick Start (Docker)
1.  Ensure Docker is running.
2.  Run the following command:
    ```bash
    make up
    ```
3.  Access the application:
    - **Frontend**: http://localhost:5173
    - **Backend API**: http://localhost:3000
    - **Blockchain Node**: http://localhost:8545

## Local Development (No Docker)
If you cannot use Docker, you can run each service individually:

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Blockchain
```bash
cd blockchain
npm install
npx hardhat node
```

## Architecture
- **Backend**: Node.js (Fastify) + SQLite
- **Frontend**: React (Vite) + Tailwind CSS
- **Blockchain**: Hardhat + Solidity
# ft_transcendence
