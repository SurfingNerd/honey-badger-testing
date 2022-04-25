import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {
  const nodes = await getNodesFromCliArgs();

  nodes.forEach(n=> {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    console.log(`stopping node ${nodeName}`);
    try {
      cmdR(nodeName, `screen -X -S node_test quit`);
    } catch(e) {
      console.log('ignored error.');
    }
    
    console.log(`pulling repo ${nodeName}`);
    cmdR(nodeName, `cd ~/dmdv4-testnet && git pull`);

    try {
      console.log(`building ${nodeName}`);
      cmdR(nodeName, `cd ~/dmdv4-testnet && ~/dmdv4-testnet/build-from-source.sh`);

    } catch (e) {
      // compile results in non-zero exit code if there are warnings, so we ignore them.
    }

    
    console.log(`starting ${nodeName}`);
    cmdR(nodeName, `cd dmdv4-testnet && screen -S node_test -d -m ~/dmdv4-testnet/start.sh`);
  });
}


//todo find better command, this kind of hard kills it.
run();