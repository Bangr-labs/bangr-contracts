const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
var ncp = require('ncp').ncp;
ncp.limit = 16;

// This script is used to test and deploy the wallet factory and smart wallets

async function main() {
    // Load config
    let config = JSON.parse(fs.readFileSync('../front/src/config/contracts-config.json'));
    const cid = (await hre.ethers.provider.getNetwork()).chainId;
    
    console.log('cid', cid)
    const me = (await hre.ethers.getSigners())[0].address
    console.log('me', me)

    const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
    const wl = await WalletLogic.deploy();
    console.log("Logic: " + wl.address);

    const wf = await ethers.getContractAt(
        getAbi("../../front/src/config/abi/WalletFactory.json"),
        config[cid]["SWFactory"]);
    console.log("Factory: " + wf.address);

    const setSWLogic = await wf.setSCWLogic(wl.address);
    await setSWLogic.wait();
    console.log('done')
    const scwLogic = await wf.logic();
    console.log("Logic: " + scwLogic);
    // const deployScw = await wf.deploy(me, {gasLimit: 2000000});
    // await deployScw.wait();

    // const walletAddress = await wf.getWalletAddress(me);
    // console.log("SW: " + walletAddress);


    // Save config
    // config = JSON.parse(fs.readFileSync('../front/src/config/contracts-config.json'));
    // config[cid] = {"SWLogic": wl.address};
    // config[cid]["SWFactory"] = wf.address;
    // let data = JSON.stringify(config);
    // fs.writeFileSync('../front/src/config/contracts-config.json', data);
}

const getAbi = (p) => {
    try {
        const dir = path.resolve(
            __dirname,
            p
        )
        //   console.log(dir)
        const file = fs.readFileSync(dir, "utf8")
        const json = JSON.parse(file)
        const abi = json
        //   console.log(`abi`, abi)

        return abi
    } catch (e) {
        console.log(`e`, e)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});