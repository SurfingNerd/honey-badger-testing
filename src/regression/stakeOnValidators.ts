

// Prerequisite:
// Candidate node is running, and not registered as validator node.
// Maximum number of Nodes not reached yet.

// Action
// stacker adds a pool for candidate node.

// Expected result
// The Node get's picked up as validator within the next epoch swich.


import { loadNodeInfosFromTestnetDirectory } from './nodeInfo';

import { ConfigManager } from '../configManager';
import { ContractManager } from '../contractManager';
import { BigNumber } from 'bignumber.js';
import { generateAddressesFromSeed } from '../utils';

import prompt from 'prompt';



// import { StakingHbbft } from  '../abi/contracts/StakingHbbft'


//const x : StakingHbbft = {};


//const stackingContract = StakingHbbft.

//const contract = new web3.eth.Contract()



/**
 * 
 * @param autostakeCount defines how many nodes should be autostaked without even prompting.
 * @returns 
 */
export async function stakeOnValidators(autostakeCount = 0) {

  BigNumber.config({ EXPONENTIAL_AT: 1000 })

  const web3 = ConfigManager.getWeb3();
  const defaultGasPrice = '1000000000';

  const contractManager = new ContractManager(web3);

  const validatorSet = contractManager.getValidatorSetHbbft();
  const staking = await contractManager.getStakingHbbft();
  const stakingPools = await staking.methods.getPools().call();

  const currentTimestamp = await validatorSet.methods.getCurrentTimestamp().call();
  console.log('current Time:', currentTimestamp);
  
  let currentValidators = await validatorSet.methods.getValidators().call();

  currentValidators = currentValidators.map(x=>x.toLowerCase());

  console.log('current Validators:');

  currentValidators.forEach(x=>console.log(x));

  const nodeInfos = loadNodeInfosFromTestnetDirectory();

  //find an account that is free to stake:
  const config = ConfigManager.getConfig();

  const numOfAddresses = 100;

  console.log(`calculating ${numOfAddresses} addresses from seed...`);
  const addressPairs = generateAddressesFromSeed(config.mnemonic, numOfAddresses);

  const minStakeBN = new BigNumber(await staking.methods.candidateMinStake().call());

  console.log('min Stake: ', minStakeBN.toString());

  let autostakesLeft = autostakeCount;

  for(let i = 0; i < nodeInfos.validators.length; i++) {

    const validator = nodeInfos.validators[i];
    

    const stakingAddress = await validatorSet.methods.stakingByMiningAddress(validator).call();
    const stakingAddressBN = new BigNumber(stakingAddress);
    
    if (!stakingAddressBN.isZero()) {
      console.log(`validator ${validator} is already assigned to the pool ${stakingAddress}`);
      continue;
    }

    let isCurrentValidator = currentValidators.indexOf(validator) !== -1;

    if (isCurrentValidator) {
      console.log(`validator ${validator} is a current validator. (probably MOC Node)`);
      continue;
    }

    console.log(`validator ${validator} is able to get picked up as new pool!`);
    prompt.start();

    var promptSchema : prompt.Schema = {
      properties: {
        choice: {
          pattern: /^[yYnNcC\s\-]+$/,
          message: 'answer must be one of (y) yes,  (n) no, next address, (c) cancel)',
          required: true
        },
      }
    };
    
    for(let accountIndex = config.mnemonicAccountIndex + i; accountIndex < numOfAddresses; accountIndex++) {

      const keypair = addressPairs[accountIndex];
      const stakingAddress = await validatorSet.methods.miningByStakingAddress(keypair.address).call();

      const stakingAddressBN = new BigNumber(stakingAddress);

      if (stakingAddressBN.isZero()) {

        console.log(`Fund available address for staking pool: ${keypair.address}`);

        let choice = 'c';

        if (autostakesLeft > 0) {
          //don't prompt on autostake
          autostakesLeft--;
          choice = 'y';
        } else {
          prompt.message = `?create pool ${keypair.address} for validator ${validator} ? \n  (y) yes,  (n) no, next address, (c) cancel)`;
          const promptResult = await prompt.get([promptSchema]);
          console.log('prompt result: ', promptResult.choice);
          choice = promptResult.choice.toString().toLowerCase();
        }
        

        switch( choice ) {
          case 'y':

            //check if the account is funded.
            const balance = await web3.eth.getBalance(keypair.address);
            const balanceBN = new BigNumber(balance);

            if (balanceBN.lt(minStakeBN)) {
              const valueToSend = minStakeBN.plus(new BigNumber(web3.utils.toWei('1')));
              
              console.log(`${keypair.address} does not have enough balance. feeding from account ${web3.eth.defaultAccount}`, valueToSend.toString());
              await web3.eth.sendTransaction({to: keypair.address, value: valueToSend.toString(), gas: '21000'});
            }

            // const addAddress = {
            //   address: keypair.address,
            //   privateKey: addressPairs[config.mnemonicAccountIndex].privateKey
            // }
  
            const addedWalletAccount = web3.eth.accounts.wallet.add(keypair);
            //console.log(`new wallet added: `, addedWalletAccount);
            const publicKey = nodeInfos.public_keys[i];
            const ip = nodeInfos.ip_addresses[i];

            console.log(`Adding new Pool: ${validator} ${publicKey} ${ip}`);
            const addPoolResult = await staking.methods.addPool(validator, publicKey, ip).send({ from: keypair.address, value: minStakeBN.toString(), gas: '2100000', gasPrice: defaultGasPrice });
            //add this private key to the web3 context.
            console.log(`add Pool transaction: `, addPoolResult.transactionHash);
            break;
          case 'n':
            continue;
          case 'c':
            console.log('operation canceled.');
            return;
          default:
            console.error('unexpected input:', choice);
            return;
        }


        //if (promptResult.)

        break;
      }

      if (autostakeCount > 0 && autostakesLeft === 0) {
        //if we have done all autostake actions,
        //we are finished, don't prompt anymore.

      }

      if (i === numOfAddresses) {
        console.error(`giving up finding a address after ${numOfAddresses} tries.`);
      }
    }

    //prompt.get([''])
  }
  
}