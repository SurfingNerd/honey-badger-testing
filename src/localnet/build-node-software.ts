import { ConfigManager } from "../configManager";
import { cmd } from "../remoteCommand";

async function run()  {

  const config = ConfigManager.getConfig();

  let profile = config.openEthereumProfile;

  if (profile.length === 0) {
    profile = 'release';
  }

  cmd(`cargo build --manifest-path ../openethereum/Cargo.toml --profile ${profile}`);
}

run();