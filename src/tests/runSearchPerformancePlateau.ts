import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { sleep } from "../utils/time";
import fs from "fs";
import { awaitTransactions } from "../tools/awaitTransactions";

function toNumber(value: string | number) : number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return Number.parseInt(value);
  }

  throw Error('not a number');
  
}

async function run() {

  const contractManager = ContractManager.get();
  const web3 = contractManager.web3;

  const wallets = ConfigManager.insertWallets(web3, 100);

  const defaultGasPrice = '1000000000';
  console.log("Warmup: Funding Accounts.");

  let confirmed = 0;
  let feedAccount = web3.eth.defaultAccount!;
  let nonceFeed = await web3.eth.getTransactionCount(feedAccount);
  for(const wallet of wallets) {
    web3.eth.sendTransaction({ from: feedAccount, to: wallet.address, nonce: nonceFeed, value: web3.utils.toWei('1', "ether"), gas: "21000", gasPrice: defaultGasPrice})
      .once("receipt", () => {
        confirmed++
      });
      nonceFeed++;
  }

  console.log('waiting for Accounts to be funded.');

  while ( confirmed < wallets.length) {
    console.log(`confirmed ${confirmed}/${wallets.length}`);
    await sleep(1000);
  }

  console.log('funds transfers confirmed.');
  console.log('Ramping up - finding plateu');

  let txPerAccount = 1;
  let outputFile = 'jupyter/data/hbbft/plateau/find-plateau.csv';
  console.log(`writing output to ${outputFile}`);
  fs.writeFileSync(outputFile, `"tx_per_account","num_of_accounts","total_txs","number_of_blocks","sum_of_block_time","blockStart","blockEnd","block_per_second","txs_per_second"\n`);
   
  // console.log(`sending one transaction to warmup block production`);
  // make a transaction to ensure the start of block production on hbbft.
  //  web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: web3.eth.defaultAccount!, nonce: nonceFeed, value: web3.utils.toWei('1', "ether"), gas: "21000", gasPrice: defaultGasPrice});

  while (txPerAccount < 1000) { // this while condition is kind of a max - we early exit if we have found a plateau.

    
    const blockStart = await web3.eth.getBlockNumber();
    const blockStartInstance = await web3.eth.getBlock(blockStart);
    const blockStartTime = toNumber(blockStartInstance.timestamp);

    let totalTxs = txPerAccount * wallets.length;
    let transactionHashesToConfirm : Array<string> = [];

    console.log(`Starting test section with ${txPerAccount} transactions per account with ${wallets.length} accounts. Total TX: ${totalTxs}`);

    for(const wallet of wallets) {

      let nonce = await web3.eth.getTransactionCount(wallet.address);
      // let signedTransaction : Array<SignedTransaction> = [];
      for(let i = 0; i<txPerAccount; i++) {
        const txConfig = {from: wallet.address, to: wallet.address, value: '0', nonce, gas: "21000", gasPrice: defaultGasPrice};
        const signed =  await wallet.signTransaction(txConfig);
        
        
        if (signed.transactionHash) {
          transactionHashesToConfirm.push(signed.transactionHash);
        }
        else {
          console.log('no hash for tx', txConfig);
        }

        // todo: sendSignedTransaction puts a lot of load on to NodeJS and the RPC Node.
        // https://github.com/web3/web3.js/issues/4034
        // a solution could be:
        // web3.currentProvider.send({
      //     method: 'eth_sendRawTransaction',
      //     params: [rawSignedTxData],
      //     jsonrpc: "2.0",
      // }, (error, result) => { ... });
        // web3.eth.sendSignedTransaction(signed.rawTransaction!);
        
        web3.eth.sendSignedTransaction(signed.rawTransaction!);

        //if (web3.eth.currentProvider) {
          //console.log(typeof web3.eth.currentProvider);
        //  web3.eth.sendSignedTransaction(signed.rawTransaction!);
          //   web3.currentProvider.send({
          //     method: 'eth_sendRawTransaction',
          //     params: [signed.rawTransaction!],
          //     jsonrpc: "2.0",
          // });
        //}
        
        
        //web3.eth.signTransaction({});
        // web3.eth.sendTransaction({ from: wallet.address, to: wallet.address, value: '0', nonce, gas: "21000", gasPrice: defaultGasPrice})
        // .once("transactionHash", (transactionHash) => {
        //   transactionHashesToConfirm.push(transactionHash);
        // });
        nonce++;
      }
    }

    // console.log(`waiting until all ${totalTxs} transactions was sent`);

    // while(transactionHashesToConfirm.length < totalTxs) {
    //   console.log(`${transactionHashesToConfirm.length}/${totalTxs} ( ${(transactionHashesToConfirm.length/totalTxs).toPrecision(4)}%)`);
    //   sleep(1000);
    // }

    console.log(`transactions Sent: ${transactionHashesToConfirm.length} scanning blocks to verify transaction receipts...`);
    


    const blockEnd = await awaitTransactions(web3, blockStart, transactionHashesToConfirm);
    console.log(`all transactions confirmed with block:`, blockEnd);

    const blockEndInstance = await web3.eth.getBlock(blockEnd);
    const numOfBlocks = blockEnd - blockStart;
    const blockEndTime = toNumber(blockEndInstance.timestamp);
    const sumOfBlockTime = blockEndTime - blockStartTime;
    const blocksPerSecond = numOfBlocks / sumOfBlockTime;
    const txsPerSecond = totalTxs / sumOfBlockTime;

    fs.appendFileSync(outputFile, `"${txPerAccount}","${wallets.length}","${totalTxs}","${numOfBlocks}","${sumOfBlockTime}","${blockStart}","${blockEnd}","${blocksPerSecond.toPrecision(4)}","${txsPerSecond.toPrecision(4)}"\n`);
    txPerAccount++;
  }
  

  console.log('transactions funded.');

}

run();