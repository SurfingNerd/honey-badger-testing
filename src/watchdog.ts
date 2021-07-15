import Web3 from "web3";

import { BlockHeader } from "web3-eth";
import {Subscription} from 'web3-core-subscriptions';
import { ContractManager } from "./contractManager";
import { NodeManager } from "./regression/nodeManager";
import { Dictionary } from "underscore";
import BigNumber from "bignumber.js";



/**
 * Watches for state changes for the POSDAO Contracts
 * Also has a memory.
 */
export class Watchdog {

  public currentValidators : Array<string> = [];
  public pendingValidators : Array<string> = [];
  public numberOfAcksWritten : number = 0;
  public numberOfPartsWritten : number = 0;

  public latestKnownBlock: number = 0;

  public subscription?: Subscription<BlockHeader>;

  //tracks the time of the latest pool restart.
  //after a restart, the candidate node software should announce it's availability again.
  //after announcing the availability, the last restart entry get's deleted again.
  public latestpoolRestarts : Dictionary<number> = {};

  public constructor(public contractManager : ContractManager, public manager: NodeManager) {
    BigNumber.config({ EXPONENTIAL_AT: 1000 })
  }

  public static deepEquals(a: any, b: any) : boolean {
    return JSON.stringify(a) ===  JSON.stringify(b);
  }

  public static createDiffgram<T>(before: Array<T>, after: Array<T>) :
  { added: Array<T>, removed: Array<T> } 
  {

    let removed = before.filter(x => !after.includes(x))
    let added = after.filter(x=> !before.includes(x));

    return {added, removed};

  }

  public async checkValidaterState( poolAddress: string, callback = async () => {}) {
    
    //let date = new Date();

    const now = Date.now();

    //console.log('checking validator state at ', date);

    //are we already in a restart phase ??
    if (this.latestpoolRestarts[poolAddress]) {
      // wait up to a minute for the restart of the node software
      if ((now - this.latestpoolRestarts[poolAddress]) < 60000) {
        return;
      }
    }
    
    //const func = async () => {

    const staking = await this.contractManager.getStakingHbbft();
    //const isPoolActive = await staking.methods.isPoolActive(poolAddress).call();
    const isPool2BeElected = await staking.methods.isPoolActive(poolAddress).call();
    
    if (!isPool2BeElected) {

      //console.log(`pool ${poolAddress} is not active.`);
      //should it be active ??
      console.log(`query stakeAmountTotal for ${poolAddress}`)
      //const currentStake = new BigNumber(await staking.methods.stakeAmountTotal(poolAddress).call());
      const validatorSet = this.contractManager.getValidatorSetHbbft();
      const miningAddress = await validatorSet.methods.miningByStakingAddress(poolAddress).call();
      const currentStake = new BigNumber(await staking.methods.stakeAmountTotal(poolAddress).call());
      const currentStakeOnMining = new BigNumber(await staking.methods.stakeAmountTotal(miningAddress).call());
      const candidateMinStake = new BigNumber(await staking.methods.candidateMinStake().call());
      console.log(`pool: ${poolAddress} stake: ${currentStake.toNumber()} of minimum: ${candidateMinStake} (Stake on Mining: ${currentStakeOnMining})`);
      
      //await staking.methods.stake

      if (currentStake.isGreaterThanOrEqualTo(candidateMinStake)) {
        const validatorAvailableSince = new BigNumber(await validatorSet.methods.validatorAvailableSince(miningAddress).call());
        console.log(`pool ${poolAddress} has enough stake, available since: ${validatorAvailableSince.toNumber()} .it should be available....`);
        
        if (validatorAvailableSince.isZero()) {
          console.log(`pool ${poolAddress} mining address ${miningAddress} is not available, has it run into a problem ? let us restart it.`);
          const asyncRestart = async() => {
            this.latestpoolRestarts[poolAddress] = now;
            console.log(`stopping... starting shutdown of pool ${poolAddress} mining address ${miningAddress}`);

            const nodes = this.manager.nodeStates.filter(x=> x.address == miningAddress);
            if (nodes.length === 0) {
              console.error(`could not find a node we can manage for mining address ${miningAddress}`);
              return;
            }

            if (nodes.length > 1 ) {
              console.error(`could not find a node we can manage for mining address ${miningAddress}`);
              return;
            }

            console.log(`restarting node nr. ${nodes[0].nodeID} ${miningAddress}`);
            await nodes[0].stop();
            console.log(`stopped  ${nodes[0].nodeID} ${miningAddress}`);
            await nodes[0].start();
          }

          //start the async restart, but do not await it.
          asyncRestart();

        }
      } 

      await callback();
        
      }
  }

  private async checkAllValidaterStates() {

    this.manager.nodeStates.forEach((s) => {
      if (s.address) {
        this.checkValidaterState(s.address);
      }
    });

  }


  public startWatching() {

    //this.subscription =
    //this.contractManager.web3.eth.subscribe('newBlockHeaders',

    const functionCall = async () => {
      // if (error) {
      //   console.log(`error during newBlockHeaders: `, error);
      // }
      // else { //assume blockHeader always set if there is not error.

        const currentBlock = await this.contractManager.web3.eth.getBlockNumber();

        if (currentBlock == this.latestKnownBlock) {
          //try again in a few ms.
          setTimeout(functionCall, 100);
          return;
        }

        console.log(`processing block:`, this.latestKnownBlock );
        this.latestKnownBlock = currentBlock;

        const pendingValidators = await this.contractManager.getValidatorSetHbbft().methods.getPendingValidators().call();
        if (!Watchdog.deepEquals(pendingValidators, this.pendingValidators)) {
          console.log(`switched pending validators from - to`, this.pendingValidators, pendingValidators );
          console.log(`Difference: `, Watchdog.createDiffgram(this.pendingValidators, pendingValidators));
          this.pendingValidators = pendingValidators;
        }

        const currentValidators = await this.contractManager.getValidatorSetHbbft().methods.getValidators().call();
        if (!Watchdog.deepEquals(currentValidators, this.currentValidators)) {
          console.log(`switched currentValidators  from - to`, this.currentValidators, currentValidators);
          console.log(`Difference: `, Watchdog.createDiffgram(this.currentValidators, currentValidators));
          this.currentValidators = currentValidators;
        }

        const keyGenHistory = await this.contractManager.getKeyGenHistory();
        const numberOfFragmentsWritten = await keyGenHistory.methods.getNumberOfKeyFragmentsWritten().call();
        
        const numberOfPartsWritten = Number.parseInt(numberOfFragmentsWritten[0]);
        const numberOfAcksWritten = Number.parseInt(numberOfFragmentsWritten[1]);

        if (this.numberOfPartsWritten != numberOfPartsWritten) {
          console.log(`Number of Parts written changed from ${this.numberOfPartsWritten} to ${numberOfPartsWritten}`);
          
          this.numberOfPartsWritten =  numberOfPartsWritten;
        }


        if (this.numberOfAcksWritten != numberOfAcksWritten) {
          console.log(`Number of ACKS written changed from ${this.numberOfAcksWritten} to ${numberOfAcksWritten}`);
          this.numberOfAcksWritten =  numberOfAcksWritten;
        }

        // const currentValidators = await this.contractManager.getStakingHbbft() getValidatorSetHbbft().methods.getValidators().call();
        // if (!Watchdog.deepEquals(currentValidators, this.currentValidators)) {
        //   console.log(`switched currentValidators  from - to`, this.currentValidators, currentValidators);
        //   this.currentValidators = currentValidators;
        // }

        // await this.checkValidaterState()

        setTimeout(functionCall, 100);
      }

      functionCall();

      //periodic checks every second:
      const timeout = setInterval(async () => {
        console.log(`checking validator nodes reboot...`);
        await this.checkAllValidaterStates();

      }, 10000);
  }



  public async stopWatching() {
    if (this.subscription) {
      await this.subscription.unsubscribe();
    }
  }

}
