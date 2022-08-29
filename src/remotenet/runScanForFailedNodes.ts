import { ConfigManager } from "../configManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {

  const searchTerm = "Updating Honey Badger instance failed!";
  const nodes = await getNodesFromCliArgs();
  const config = ConfigManager.getConfig();
  const logFile = `~/${config.installDir}/parity.log`;

  for(const node of nodes) {
    const result = cmdR(node.sshNodeName() , `tail -n 100 ${logFile} | grep '${searchTerm}' | cat`);
  }

}


run();