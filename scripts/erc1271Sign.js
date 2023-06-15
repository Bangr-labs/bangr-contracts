const hre = require("hardhat");
const fs = require("fs");

// my address here : 0xcc66D2cD310347185e31C67A0FD672D64d8eFAB6
// this script is used to erc1271 sign a message
async function main() {
    const me = (await hre.ethers.getSigners())[0]
    const myProxyAddress = "0x5522BA0a1aCCfD5347f871B7fef71246Bd720648"
    const proxy = await hre.ethers.getContractAt("WalletLogic", myProxyAddress);

    // const message = "I hereby declare that I am the address owner.";
    // const message = "MtPelerin-6427155b02d32f001a56762c-1234";
    const message = "MtPelerin-4321";
    const messageHash = ethers.utils.hashMessage(message);

    console.log('messageHash', messageHash)

    const signTx = await proxy.connect(me).addSignature(messageHash)
    console.log('signTx', signTx.hash)
    
    await signTx.wait()
    console.log('signTx done')
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});