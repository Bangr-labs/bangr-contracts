const { exec } = require("child_process");
var fs = require('fs');

const rawdata = fs.readFileSync('../relayer/chains.json'); //or '../relayer/chains.json'
let chains = JSON.parse(rawdata);


for (const [cid, rpc] of Object.entries(chains)){
    deploy(cid, rpc)
}

async function deploy(cid, rpc) {
    let deployProcess = exec(`npx hardhat run --network ${cid} scripts/deployWalletProxy.js`, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    deployProcess.stdout.on("data", (data) => {
        console.log(`SCRIPT ${cid}: ${data}`)
    })
}




