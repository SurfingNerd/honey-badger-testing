import child_process from 'child_process';
import { loadNodeInfosFromTestnetDirectory } from './nodeInfo';
import fs from 'fs';
import path from 'path';
import { ConfigManager } from '../configManager';
import { cmd } from '../remoteCommand';

export class NodeState {


  public childProcess?: child_process.ChildProcess;
  public isStarted = false;

  isDeactivated: boolean = false;


  public constructor(public nodeID: number, public publicKey: string | undefined, public address: string | undefined) {
  }



  public static getNodeBaseDir(nodeId: number,): string {

    const nodesDir = ConfigManager.getNodesDir();

    const cwd = process.cwd();

    if (nodeId > 0) {
      return `${cwd}/testnet/${nodesDir}/node${nodeId}`;
    } else {
      return `${cwd}/testnet/${nodesDir}/rpc_node`;
    }

  }

  public static startNode(nodeId: number, extraFlags: string[] = []): child_process.ChildProcess {


    // const execOption: child_process.ExecFileOptions = {
    //   cwd: NodeState.getNodeBaseDir(nodeId),
    //   maxBuffer: 100 * 1024 * 1024 /** 100 MB */,
    // }

    const spawnOption: child_process.SpawnOptions = {
      cwd: NodeState.getNodeBaseDir(nodeId),
      stdio: 'ignore'
    };

    const config = ConfigManager.getConfig();
    // console.log('cwd:', cwd);
    const openethereumsubdirectory = `../diamond-node/target/${config.openEthereumProfile}/diamond-node`;

    const cwd = process.cwd();
    const resolvedPath = path.resolve(cwd, openethereumsubdirectory);
    // console.log('resolvedPath = ', resolvedPath);

    const spawned = child_process.spawn(resolvedPath, ['--config=node.toml', ...extraFlags], spawnOption);
    //spawned.



    //child_process.spawn()
    // const proc = child_process.execFile(resolvedPath, ['--config=node.toml', ...extraFlags], execOption, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
    //   console.log(
    //     `result from Node ${nodeId}: \n
    //     cmd:     ${error?.cmd} \n
    //     code:    ${error?.code} \n
    //     killed:  ${error?.killed} \n
    //     message: ${error?.message} \n
    //     name:    ${error?.name} \n
    //   `);
    // });

    // proc.addListener('message',(message: any, sendHandle: net.Socket | net.Server) => {
    //   console.log(`n: ${nodeId} message: ${message}`);
    // })

    // proc.stdout?.addListener('data', (chunk: any) => {
    //   console.log(`n: ${nodeId} data: ${chunk}`);
    // })

    // proc.on("message", (message: any) => {
    //   console.log(`m:  ${nodeId} message: ${message} `);
    // });

    console.log(`node ${nodeId} started!`);

    return spawned;
  }

  public static startRpcNode(extraFlags: string[] = []): child_process.ChildProcess {

    const cwd = process.cwd();

    const nodesDir = ConfigManager.getNodesDir();
    console.log('nodesDir:', nodesDir);

    const config = ConfigManager.getConfig();

    const openethereumsubdirectory = `../diamond-node/target/${config.openEthereumProfile}/diamond-node`;

    const resolvedPath = path.resolve(cwd, openethereumsubdirectory);
    // console.log('resolvedPath = ', resolvedPath);


    const spawnOption: child_process.SpawnOptions = {
      cwd: `${cwd}/testnet/${nodesDir}/rpc_node`,
      stdio: 'ignore',
    };

    const spawned = child_process.spawn(resolvedPath, ['--config=node.toml', ...extraFlags], spawnOption);

    console.log(`rpc node started!`);

    return spawned;
    // //child_process.spawn()
    // const proc = child_process.execFile(resolvedPath, ['--config=node.toml', ...extraFlags], execOption, (error: child_process.ExecException | null, stdout: string, stderr: string) => {
    //   console.log(
    //     `result from RPC Node: \n
    //     cmd:     ${error?.cmd} \n
    //     code:    ${error?.code} \n
    //     killed:  ${error?.killed} \n
    //     message: ${error?.message} \n
    //     name:    ${error?.name} \n
    //   `);
    // });

    // stdOut: ${stdout} \n
    // stdErr: ${stderr}

  }

  public start(force = false) {

    if (this.isDeactivated) {
      console.log(`node ${this.address} is deactivated. ignoring start command.`);
      return;
    }

    if (this.isStarted && !force) {
      throw new Error(`Node ${this.nodeID} is already started.`);
    }

    //const extraFlags = '--tx-queue-mem-limit=1000 --no-persistent-txqueue'; //  --tx-queue-size=100000
    const extraFlags = ["--tx-queue-mem-limit=1000", "--no-persistent-txqueue", "--tx-queue-size=100000"];

    if (this.nodeID > 0) {
      this.childProcess = NodeState.startNode(this.nodeID, extraFlags);
    } else {
      this.childProcess = NodeState.startRpcNode(extraFlags);
    }


    this.isStarted = true;
    console.log(`started child process with ID ${this.childProcess.pid}`);
  }

  public async stop(force = false) {

    if (!this.isStarted && !force) {
      throw new Error(`Can't stop node ${this.nodeID} that has not been started yet.`);
    }

    if (!this.childProcess) {
      throw new Error(`Can't stop node ${this.nodeID} without having a child process.`);
    }


    let isExited = false;


    this.childProcess.on("close", (x) => {
      console.log("closed!!", x);
      isExited = true;
      this.isStarted = false;
    })

    // this.childProcess.on("exit", (x)=> {
    //   console.log("exited!", x);
    //   isExited = true;
    //   this.isStarted = false;
    // })

    function sleep(milliseconds: number) {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    }


    //this.childProcess.kill("SIGKILL");
    this.childProcess.kill("SIGTERM");
    //process.kill(this.childProcess.pid, 15); // 15 = nice and gently

    // const killCmd = `kill ${this.childProcess.pid}`;
    // console.log(killCmd);

    // const killer = child_process.exec(killCmd);
    // console.log(`killer: ${killer.pid}`);

    console.log('wait for exit');
    while (isExited === false) {
      //await setTimeout(() =>{}, 1000);
      await sleep(100);
      process.stdout.write('.');
    }
  }

  public deactivate() {
    this.stop();
    this.isDeactivated = true;
  }

  public async restoreDB(backupDir: string) {

    if (this.isStarted) {
      throw new Error(`Can't restore DB while node ${this.nodeID} is running.`);
    }

    const nodesDir = ConfigManager.getNodesDir();

    cmd(`cp -r ${backupDir} testnet/${nodesDir}/node${this.nodeID}/data/chains/`);

  }

  public async clearDB() {

    const baseDir = NodeState.getNodeBaseDir(this.nodeID);

    let directoryToDelete = path.join(baseDir, 'data', 'cache');
    console.log('deleting:', directoryToDelete);
    fs.rmdirSync(directoryToDelete, { recursive: true });

    directoryToDelete = path.join(baseDir, 'data', 'chains');
    console.log('deleting:', directoryToDelete);
    fs.rmdirSync(directoryToDelete, { recursive: true });

    console.log('finished clearing DB for Node ', this.nodeID);
  }

  public sshNodeName() {
    return `hbbft${this.nodeID}`;
  }

}

export class NodeManager {



  static s_instance = new NodeManager()

  private constructor() {

  }

  public static get(): NodeManager {

    if (NodeManager.s_instance.nodeStates.length === 0) {
      NodeManager.s_instance.initFromTestnetManifest();

    }
    return NodeManager.s_instance;
  }

  public nodeStates: Array<NodeState> = [];

  public rpcNode: NodeState | undefined;



  public startNode(nodeID: number, force = false): NodeState {

    const result = this.getNode(nodeID);
    result.start(force);
    return result;
  }

  public startRpcNode(force = false) {

    this.rpcNode = new NodeState(0, undefined, undefined);

    this.rpcNode.start(force);
  }

  public startAllNodes(force = false): NodeState[] {
    this.nodeStates.forEach((n) => {
      n.start(force);
    });
    return this.nodeStates;
  }

  // stop's all validator nodes, but not the RPC Node
  public stopAllNodes(force = false) {
    this.nodeStates.forEach((n) => {
      if (n.isStarted) {
        n.stop(force);
      }
    });
  }

  public stopRpcNode(force = false) {
    if (this.rpcNode) {
      if (this.rpcNode.isStarted) {
        this.rpcNode.stop(force);
      }
    }
  }

  public getNode(nodeID: number): NodeState {

    if (nodeID == 0) {
      throw new Error('nodeIDs are index-1 based');
    }

    this.ensureNodeStates(nodeID);
    const nodeState = this.nodeStates[nodeID - 1];
    console.assert(nodeState.nodeID == nodeID, 'Unexpected NodeID');
    return nodeState;
  }

  private ensureNodeStates(numOfStates: number) {

    if (this.nodeStates.length < numOfStates) {

      const nodeInfos = loadNodeInfosFromTestnetDirectory();

      while (this.nodeStates.length < numOfStates) {
        const publicKey = nodeInfos?.public_keys[this.nodeStates.length];
        const address = nodeInfos?.validators[this.nodeStates.length];
        this.nodeStates.push(new NodeState(this.nodeStates.length + 1, publicKey, address));
      }
    }
  }

  public initFromTestnetManifest() {
    const nodeInfos = loadNodeInfosFromTestnetDirectory();
    if (nodeInfos) {
      this.ensureNodeStates(nodeInfos.public_keys.length);
      this.rpcNode = new NodeState(0, undefined, undefined);
    }
  }

  public getNodeByPublicKey(proposer: string): NodeState | undefined {
    const nodes = this.nodeStates.filter(x => x.publicKey == proposer);

    if (nodes.length > 1) {
      throw Error(`More than one Node with Public Key found: ${proposer}`);
    }

    if (nodes.length === 1) {
      return nodes[0];
    }

    return undefined;
  }

}


// async function testIt() {

//   const nodeState = NodeManager.get().startNode(2);
//   await nodeState.stop();
// }


// testIt();

