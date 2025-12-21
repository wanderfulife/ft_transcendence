import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
    solidity: "0.8.19",
    networks: {
        hardhat: {
            chainId: 1337
        },
        // Add Avalanche Fuji Testnet configuration here if needed
        fuji: {
            url: "https://api.avax-test.network/ext/bc/C/rpc",
            chainId: 43113,
            accounts: [] // Add private key via env var
        }
    }
};

export default config;
