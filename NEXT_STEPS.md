# Implementation Plan - ft_transcendence Finalization

## Goal Description
The goal is to bring the `ft_transcendence` project to full compliance with the subject requirements. Currently, the project is missing the actual Blockchain integration (mocked) and the User Management UI (Login/Register/Profile pages). We need to implement these to pass the evaluation.

## User Review Required
> [!IMPORTANT]
> **Blockchain**: We will be using the local Hardhat network for development. Ensure the `blockchain` container is running (`npx hardhat node`).
> **Frontend**: We are sticking to **Vanilla TypeScript** to strictly follow the "No Framework" module constraint for the frontend (except Tailwind).

## Proposed Changes

### Backend (`/backend`)

#### [MODIFY] [backend/src/models/match.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/backend/src/models/match.ts)
- Update `MatchModel.create` to call the Blockchain service.

#### [NEW] [backend/src/services/blockchain.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/backend/src/services/blockchain.ts)
- Create a service using `ethers.js` to interact with the deployed smart contract.
- Implement `recordMatch(player1, player2, score1, score2, winner)` function.
- Needs the Contract Address and ABI (ABI is in `blockchain/artifacts`).

### Frontend (`/frontend`)

#### [NEW] [frontend/src/pages/Login.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/frontend/src/pages/Login.ts)
- Create a Login component/page using Vanilla TS.
- Form with Email/Password.
- Fetch request to `/api/auth/login`.
- Handle JWT token storage.

#### [NEW] [frontend/src/pages/Register.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/frontend/src/pages/Register.ts)
- Create a Registration component/page.
- Form with Username, Email, Password.

#### [NEW] [frontend/src/pages/Profile.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/frontend/src/pages/Profile.ts)
- Display user stats (Win/Loss).
- Display Match History (fetched from backend).
- Avatar upload functionality (already in main, move here).

#### [MODIFY] [frontend/src/router.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/frontend/src/router.ts)
- Add routes for `/login`, `/register`, `/profile`.
- Implement basic route protection (redirect to `/login` if no token).

#### [MODIFY] [frontend/src/main.ts](file:///Users/jwander/Desktop/TRANSCENDANCE/frontend/src/main.ts)
- update navigation to include links to these new pages.

## Verification Plan

### Automated Tests
- We will write a script to simulate a game completion and verify the transaction hash is returned from the blockchain service.

### Manual Verification
1.  **Blockchain**:
    - Run the game.
    - Finish a match.
    - Check the Hardhat node console logs for the transaction.
    - Use a script to read the smart contract state and verify the score is recorded.
2.  **User Management**:
    - Go to `/register`, create a user.
    - Go to `/login`, login.
    - Go to `/profile`, check that stats are empty.
    - Play a game.
    - Go to `/profile`, check that stats are updated.
