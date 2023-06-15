const hre = require("hardhat");
const fs = require("fs");

// this script is used to switch the implementation of a proxy contract
async function main() {
    const me = (await hre.ethers.getSigners())[0]
    console.log('me', me.address)
    const myProxyAddress = "0x5522BA0a1aCCfD5347f871B7fef71246Bd720648"

    const proxy = await hre.ethers.getContractAt("WalletLogic", myProxyAddress);

    const WalletLogic = await hre.ethers.getContractFactory("WalletLogic");
    const newWalletLogic = await WalletLogic.deploy();
    await newWalletLogic.deployed();

    console.log('newWalletLogic deployed at', newWalletLogic.address)
    // const newWalletLogic = await hre.ethers.getContractAt("WalletLogic", "0x65a428b658603cfad3e47ea8b5e2a9f0e886c5e9");

    const upgradeTx = await proxy.connect(me).upgradeTo(newWalletLogic.address)
    console.log('upgradeTx', upgradeTx.hash)
    
    await upgradeTx.wait()
    console.log('upgradeTx done')

    const _IMPLEMENTATION_SLOT = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
    const implementation = await ethers.provider.getStorageAt(proxy.address, _IMPLEMENTATION_SLOT)

    console.log('new implementation of my wallet:', implementation)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});