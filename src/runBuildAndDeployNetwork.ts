import * as child from 'child_process';

import * as fs from "fs";

//var exec = require('child_process').exec, child;

const pwdResult = child.execSync("pwd");

console.log('operating in: ' + pwdResult.toString());

let deleteExistingServers 
  : boolean | undefined = undefined;

const passedArgument = process.argv[2];
const numberOfNodes = Number(passedArgument);

if (isNaN(numberOfNodes)) {
  throw Error(`passed argument is not a number: ${passedArgument}`);
}

if (numberOfNodes <= 0) {
  throw Error(`numberOfNodes must be more than 0 - passed: ${passedArgument}`);
}

if (numberOfNodes > 200) {
  throw Error(`Sanity check: numberOfNodes must be less than 200 - passed: ${passedArgument}`);
}

const startCommand = './openethereum -c node.toml';
const nodesSubdir = 'testnet/nodes';
const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

console.log('Looking up lokal nodes directory:', nodesDirAbsolute);

function cmd(command: string) : string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

//executes a command on a remote Node.
function cmdR(host: string, command: string) {
  
  console.log(command);
  //todo: proper escaping for the shell of command here.
  const remoteCommand = `ssh -t -o LogLevel=QUIET ${host} '${command}'`;
  const result = child.execSync(remoteCommand);
  const txt = result.toString();
  console.log(txt);
  return txt;
}


for(let i = 1; i <= numberOfNodes; i++) {
  console.log(`=== Node ${i} ===`);

  const nodeName = `hbbft_node${i}`;
  const remoteMainDir = '~/hbbft_testnet';

  console.log(`ensure main directory: ${remoteMainDir} on ${nodeName}`);
  cmdR(nodeName, `mkdir -p ${remoteMainDir}`);

  const scpCommand = `scp -pr ${nodesDirAbsolute}/node${i} hbbft_node${i}:~/hbbft_testnet/node${i}`;
  cmd(scpCommand);

  console.log('deploying openethereum executable.');

  const scpCommandExe = `scp ../openethereum/target/release/openethereum hbbft_node${i}:~/hbbft_testnet/node${i}`;
  cmd(scpCommandExe);

  
  
}
