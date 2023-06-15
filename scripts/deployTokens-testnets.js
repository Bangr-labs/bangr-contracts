const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
var ncp = require('ncp').ncp;
ncp.limit = 16;

// This script is used to test and deploy the wallet factory and smart wallets

async function main() {
    // Load config 
    let rawdata = fs.readFileSync('../front/src/config/contracts-config.json');
    let config = JSON.parse(rawdata);
    const cid = await (await hre.ethers.provider.getNetwork()).chainId;

    const me = (await hre.ethers.getSigners())[0].address
    console.log("Deploying token contracts...")
    const Token = await hre.ethers.getContractFactory("Token");
    const boom = await Token.deploy("Boomerang", "BOOM");
    const nuke = await Token.deploy("Nuclear", "NUKE");
    await boom.deployed();
    await nuke.deployed();
    console.log("BOOM token: " + boom.address);
    console.log("NUKE token: " + nuke.address);
    config[cid] = {"Boom": boom.address};
    config[cid]["Nuke"] = nuke.address;

    // Save config
    let data = JSON.stringify(config);
    fs.writeFileSync('../front/src/config/contracts-config.json', data);
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
        const abi = json.abi
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