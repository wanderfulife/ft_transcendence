import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const API_URL = 'http://127.0.0.1:8545';
// Hardhat Account #0 Private Key
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

const ABI = [
    "function recordScore(uint256 _matchId, string _player1, string _player2, uint256 _score1, uint256 _score2) public"
];

export const BlockchainService = {
    recordMatch: async (matchId: number, player1: string, player2: string, score1: number, score2: number) => {
        try {
            const provider = new ethers.JsonRpcProvider(API_URL);
            const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

            console.log(`[Blockchain] Recording match ${matchId} for ${player1} vs ${player2}...`);
            const tx = await contract.recordScore(matchId, player1, player2, score1, score2);
            console.log(`[Blockchain] Transaction sent: ${tx.hash}`);
            await tx.wait();
            console.log(`[Blockchain] Transaction confirmed: ${tx.hash}`);
            return tx.hash;
        } catch (error) {
            console.error('[Blockchain] Error recording match:', error);
            // Don't throw, just log. We don't want to break the game flow if blockchain is down.
            return null;
        }
    }
};
