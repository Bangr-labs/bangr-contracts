const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
var ncp = require('ncp').ncp;
ncp.limit = 16;

// This script is used to test and deploy the wallet factory and smart wallets

async function main() {

    // Load config
    const cid = (await hre.ethers.provider.getNetwork()).chainId;
    
    console.log('cid', cid)
    const me = (await hre.ethers.getSigners())[0].address
    console.log('me', me)

    const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
    const wl = await WalletLogic.deploy();
    console.log("Logic: " + wl.address);

    const WalletFactory = await hre.ethers.getContractFactory("WalletFactory");
    const wf = await WalletFactory.deploy(wl.address);
    console.log("Factory: " + wf.address);


    const deployScw = await wf.deploy(me, {gasLimit: 2000000});
    await deployScw.wait();

    const walletAddress = await wf.getWalletAddress(me);
    console.log("SW: " + walletAddress);


    // Save config
    // let config = JSON.parse(fs.readFileSync('../packages/common/config/contracts-config.json'));
    // config[cid] = {"SWLogic": wl.address};
    // config[cid]["SWFactory"] = wf.address;
    // let data = JSON.stringify(config);
    // fs.writeFileSync('../packages/common/config/contracts-config.json', data);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});