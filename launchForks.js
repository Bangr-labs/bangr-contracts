const { exec } = require("child_process");
var fs = require('fs');

const rawdata = fs.readFileSync('../relayer/chains.json'); //or '../relayer/chains.json'
let chains = JSON.parse(rawdata);

let forkPort = 10000

for (const [cid, rpc] of Object.entries(chains)){
    forkAndDeploy(cid, rpc, forkPort)
    forkPort++;
}

async function forkAndDeploy(cid, rpc, port) {
    let forkProcess = exec(`HARDHAT_CHAIN_ID=${cid} npx hardhat node --fork ` + rpc + " --port " + port.toString(), (error, stdout, stderr) => {
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
    forkProcess.stdout.on("data", (data) => {
        console.log(`FORK ${cid}: ${data}`)
    })
    console.log(`launching node... ${cid}`)
    await new Promise(r => setTimeout(r, 10000));
    
    console.log(`chain ${cid} fork launched on port ${port}`)

    let deployProcess = exec(`npx hardhat run --network ${port} scripts/deployWalletProxy-forks.js`, (error, stdout, stderr) => {
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




