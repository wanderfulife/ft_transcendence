import { ethers } from "hardhat";

async function main() {
    const score = await ethers.deployContract("Score");

    await score.waitForDeployment();

    console.log(
        `Score contract deployed to ${score.target}`
    );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
