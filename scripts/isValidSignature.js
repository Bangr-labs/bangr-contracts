const hre = require("hardhat");
const fs = require("fs");

// my address here : 0xcc66D2cD310347185e31C67A0FD672D64d8eFAB6
// this script is used to erc1271 sign a message
async function main() {
    const me = (await hre.ethers.getSigners())[0]
    const myProxyAddress = "0x4ad676Ba57dAd66868392C56F382F9ebA3071dEf"
    // const myProxyAddress = "0x42cedde51198d1773590311e2a340dc06b24cb37" //on gnosis it works !
    const proxy = await hre.ethers.getContractAt("WalletLogic", myProxyAddress);

    const message = "I hereby declare that I am the address owner.";
    const messageHash = ethers.utils.hashMessage(message);

    console.log('messageHash', messageHash)

    const isValid = await proxy.isValidSignature(messageHash, "0x")
    console.log('isValid', isValid)
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});