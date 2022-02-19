import deepEqual from "deep-equal";
import { ContractManager, KeyGenMode } from "../contractManager";


function prettyPrint(roundResult: KeyGenRoundResult) {
  return `epoch: ${roundResult.Epoch}(Block:${roundResult.RoundStartBlock} - ${roundResult.RoundEndBlock}) Success: ${roundResult.Success}  key gen round:  ${roundResult.KeyGenRound} missed Parts: ${roundResult.PartsMissedOut.length} missed Acks ${roundResult.AcksMissedOut.length}`;
}
class KeyGenRoundResult {

  public Epoch: number = 0;
  public KeyGenRound: number = 0;
  public Success: boolean = false;

  public EpochStartBlock: number = 0;
  public EpochEndBlock: number = 0;

  public RoundStartBlock: number = 0;
  public RoundEndBlock: number = 0;

  public AcksWritten: Array<String> = [];
  public AcksMissedOut: Array<String> = [];

  public PartsWritten: Array<String> = [];
  public PartsMissedOut: Array<String> = [];

  public prettyPrint() {

    return prettyPrint(this);
  }

  public printCSV() {
    return `${this.Epoch};${this.KeyGenRound};${this.Success};${this.RoundStartBlock};${this.RoundEndBlock};${this.AcksWritten.length};${this.AcksMissedOut.length};${this.PartsWritten.length};${this.PartsMissedOut.length};`;
  }

  public static printCSVHeader() {
    return `"Epoch";"KeyGenRound";"Success";"RoundStartBlock";"RoundEndBlock";"AcksWritten";"AcksMissedOut";"PartsWritten";"PartsMissedOut";`;
  }

}

class KeyGenEpochResult {

  public Epoch: number = 0;
  public EpochStartBlock: number = 0;
  public EpochEndBlock: number = 0;
  public KeyGenStart: number = 0;
  public KeyGenRounds: KeyGenRoundResult[] = [];
  public NumValidatorsAtFirstTry: number = 0;
  public NumValidatorsAtSuccess: number = 0;

  // list of validators that got removed.
  public ValidatorDropOuts: string[] = [];


}


async function run() {


  console.log('scans the network and looks watches out for nodes');
  console.log('that got included, without having their ACK transaction mined.');

  const contractManager = ContractManager.get();
  const { web3 } = contractManager;

  // key gen history:
  // 
  const keyGenHistory = await contractManager.getKeyGenHistory();

  // only finished epochs can be analysed with this function, since we need a EpochEndBlock.
  // we process the epochs backwards, starting from the epoch end, towards the start of 
  // phase 2: Key Generation Phase.
  // Phase 1 can be completly skipped, since nothing interesting for the 
  // key generation happens here.
  async function processEpoch(epochNumber: number, epochEndBlock: number): Promise<KeyGenEpochResult> {

    // only full processed epochs can be analysed.
    let result = new KeyGenEpochResult();

    //result.Epoch;
    result.EpochEndBlock = epochEndBlock;
    console.log(`processing end of epoch ${epochNumber}, starting with block ${epochEndBlock} iterating backward.`);
    result.EpochStartBlock = await contractManager.getEpochStartBlock(epochEndBlock);

    // the last key gen round is the successfull one.
    let thisKeyGenRoundIsASuccess = true;

    let blockToProcess = epochEndBlock;

    // the last block is always the last Block in the key gen round.
    let isLastBlockInKeyGenRound = true;

    let roundResult = new KeyGenRoundResult();
    roundResult.KeyGenRound = await contractManager.getKeyGenRound(blockToProcess);
    // we know that the last round is the successful one.
    roundResult.Success = true;
    roundResult.KeyGenRound = Number.MAX_SAFE_INTEGER;
    let pendingValidators = await contractManager.getPendingValidators(blockToProcess);

    do {

      let keyGenRound = await contractManager.getKeyGenRound(blockToProcess);

      
      const newPendingValidators = await contractManager.getPendingValidators(blockToProcess);
      const isSwitchInValidatorSet = !deepEqual(pendingValidators, newPendingValidators);
      pendingValidators = newPendingValidators;

      console.log(`${blockToProcess} isSwitchInValidatorSet: `, isSwitchInValidatorSet);

      

      // have we already iterated backward to the next key gen round ?
      if (keyGenRound < roundResult.KeyGenRound) {

        result.KeyGenRounds.push(roundResult);
        roundResult.Epoch = epochNumber;
        roundResult.Success = thisKeyGenRoundIsASuccess;
        // the next key gen round can not be a success.
        thisKeyGenRoundIsASuccess = false;
        roundResult.RoundEndBlock = epochEndBlock;

        console.log(`processing block:  ${blockToProcess}`);

        pendingValidators = await contractManager.getPendingValidators(blockToProcess);
        roundResult.KeyGenRound = keyGenRound;

        for (let validator of pendingValidators) {

          const state = await contractManager.getPendingValidatorState(validator, blockToProcess);

          switch (state) {
            case KeyGenMode.NotAPendingValidator:
              console.log('ERROR: unexpected state: should be a pending Validator.');
              break;
            case KeyGenMode.AllKeysDone:
            case KeyGenMode.WaitForOtherAcks:
              roundResult.PartsWritten.push(validator);
              roundResult.AcksWritten.push(validator);
              break;
            case KeyGenMode.WaitForOtherParts:
            case KeyGenMode.WaitForOtherAcks:
              roundResult.PartsWritten.push(validator);
              break;
            case KeyGenMode.WritePart:
              roundResult.PartsMissedOut.push(validator);
              roundResult.AcksMissedOut.push(validator);
              break;
            case KeyGenMode.WriteAck:
              roundResult.PartsWritten.push(validator);
              roundResult.AcksMissedOut.push(validator);
              break;
            default:
              throw Error(`unexpected ${state}`);
          }
        }

        console.log(blockToProcess, roundResult.prettyPrint());
      } else if (pendingValidators.length === 0) {
        //result.EpochStartBlock =  ;
        roundResult.RoundStartBlock = blockToProcess + 1;
        console.log(`${blockToProcess} no pending validators anymore`);
      } else {
        console.log(`${blockToProcess} switch detected`);
      }

      blockToProcess--;

      console.log(`validators: ${blockToProcess} ${pendingValidators.length}`);

      if (pendingValidators.length == 0) {
        console.log(`${blockToProcess} <= ${result.EpochStartBlock}`);
        break;
      }

      // now detect the misses.
    } while (pendingValidators.length > 0)

    //contractManager.getKeyGenState();
    // ... scanning until keygeneration phase found ....

    // console.log(`key generation phase found with block start at`);


    //console.log(result);
    //console.log(``);

    return result;
  }

  let blockToAnalyze = await web3.eth.getBlockNumber();
  console.log('current block: ', blockToAnalyze);
  let epochNumber = await contractManager.getEpoch(blockToAnalyze);

  console.log('current epoch: ', epochNumber);

  let thisEpochStart = await contractManager.getEpochStartBlock();
  console.log('this epoch started with block ', thisEpochStart);

  let epochToAnalyze = epochNumber - 1;
  blockToAnalyze = thisEpochStart - 1;

  console.log(`The analysis starts one epoch earlier ${epochToAnalyze} with block ${blockToAnalyze}`, thisEpochStart);
  
  const epochResults = [];
  const roundResults = [];

  const stopAtEpoch = epochToAnalyze - 240;
  do {
    const epochResult = await processEpoch(epochToAnalyze, blockToAnalyze);
    epochResults.push(epochResult);
    roundResults.push(...epochResult.KeyGenRounds);

    epochToAnalyze = epochToAnalyze - 1;
    blockToAnalyze =  epochResult.EpochStartBlock - 1;
  } while (epochToAnalyze > stopAtEpoch)
  

  // epochResult.
  console.log('finished!');


  console.log('epoch results:');

  epochResults.forEach(x=>{
    console.log(x);
  });

  console.log('roundResults:');

  roundResults.forEach(x=>{
    console.log(x.prettyPrint());
  });


  console.log('');
  console.log(KeyGenRoundResult.printCSVHeader());
  roundResults.forEach(x=>{
    console.log(x.printCSV());
  });

}

run();

