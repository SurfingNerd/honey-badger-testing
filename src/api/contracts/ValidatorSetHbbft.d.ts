/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type ReportedMalicious = ContractEventLog<{
  reportingValidator: string;
  maliciousValidator: string;
  blockNumber: string;
  0: string;
  1: string;
  2: string;
}>;
export type ValidatorAvailable = ContractEventLog<{
  validator: string;
  timestamp: string;
  0: string;
  1: string;
}>;
export type ValidatorUnavailable = ContractEventLog<{
  validator: string;
  timestamp: string;
  0: string;
  1: string;
}>;

export interface ValidatorSetHbbft extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): ValidatorSetHbbft;
  clone(): ValidatorSetHbbft;
  methods: {
    MAX_VALIDATORS(): NonPayableTransactionObject<string>;

    banCounter(arg0: string): NonPayableTransactionObject<string>;

    banReason(arg0: string): NonPayableTransactionObject<string>;

    bannedDelegatorsUntil(arg0: string): NonPayableTransactionObject<string>;

    bannedUntil(arg0: string): NonPayableTransactionObject<string>;

    blockRewardContract(): NonPayableTransactionObject<string>;

    isValidator(arg0: string): NonPayableTransactionObject<boolean>;

    isValidatorPrevious(arg0: string): NonPayableTransactionObject<boolean>;

    keyGenHistoryContract(): NonPayableTransactionObject<string>;

    miningByStakingAddress(arg0: string): NonPayableTransactionObject<string>;

    randomContract(): NonPayableTransactionObject<string>;

    reportingCounter(
      arg0: string,
      arg1: number | string | BN
    ): NonPayableTransactionObject<string>;

    reportingCounterTotal(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    stakingByMiningAddress(arg0: string): NonPayableTransactionObject<string>;

    stakingContract(): NonPayableTransactionObject<string>;

    validatorAvailableSince(arg0: string): NonPayableTransactionObject<string>;

    validatorCounter(arg0: string): NonPayableTransactionObject<string>;

    validatorLastSuccess(arg0: string): NonPayableTransactionObject<string>;

    /**
     * Returns the current timestamp.
     */
    getCurrentTimestamp(): NonPayableTransactionObject<string>;

    /**
     * Initializes the network parameters. Used by the constructor of the `InitializerHbbft` contract.
     * @param _blockRewardContract The address of the `BlockRewardHbbft` contract.
     * @param _initialMiningAddresses The array of initial validators' mining addresses.
     * @param _initialStakingAddresses The array of initial validators' staking addresses.
     * @param _keyGenHistoryContract The address of the `KeyGenHistory` contract.
     * @param _randomContract The address of the `RandomHbbft` contract.
     * @param _stakingContract The address of the `StakingHbbft` contract.
     */
    initialize(
      _blockRewardContract: string,
      _randomContract: string,
      _stakingContract: string,
      _keyGenHistoryContract: string,
      _initialMiningAddresses: string[],
      _initialStakingAddresses: string[]
    ): NonPayableTransactionObject<void>;

    /**
     * Called by the system when a pending validator set is ready to be activated. Only valid when msg.sender == SUPER_USER (EIP96, 2**160 - 2). After this function is called, the `getValidators` getter returns the new validator set. If this function finalizes a new validator set formed by the `newValidatorSet` function, an old validator set is also stored and can be read by the `getPreviousValidators` getter.
     */
    finalizeChange(): NonPayableTransactionObject<void>;

    /**
     * Implements the logic which forms a new validator set. If the number of active pools is greater than MAX_VALIDATORS, the logic chooses the validators randomly using a random seed generated and stored by the `RandomHbbft` contract. Automatically called by the `BlockRewardHbbft.reward` function at the latest block of the staking epoch.
     */
    newValidatorSet(): NonPayableTransactionObject<void>;

    /**
     * Removes malicious validators. Called by the the Hbbft engine when a validator has been inactive for a long period.
     * @param _miningAddresses The mining addresses of the malicious validators.
     */
    removeMaliciousValidators(
      _miningAddresses: string[]
    ): NonPayableTransactionObject<void>;

    /**
     * called by validators when a validator comes online after getting marked as unavailable caused by a failed key generation.
     */
    announceAvailability(): NonPayableTransactionObject<void>;

    /**
     * called by blockreward contract when a the reward when the block reward contract  came to the conclusion that the validators could not manage to create a new shared key together. this starts the process to find replacements for the failing candites, as well as marking them unavailable.
     */
    handleFailedKeyGeneration(): NonPayableTransactionObject<void>;

    /**
     * Reports that the malicious validator misbehaved at the specified block. Called by the node of each honest validator after the specified validator misbehaved. See https://openethereum.github.io/Validator-Set.html#reporting-contract Can only be called when the `reportMaliciousCallable` getter returns `true`.
     * @param _blockNumber The block number where the misbehavior was observed.
     * @param _maliciousMiningAddress The mining address of the malicious validator.
     */
    reportMalicious(
      _maliciousMiningAddress: string,
      _blockNumber: number | string | BN,
      arg2: string | number[]
    ): NonPayableTransactionObject<void>;

    /**
     * Binds a mining address to the specified staking address. Called by the `StakingHbbft.addPool` function when a user wants to become a candidate and creates a pool. See also the `miningByStakingAddress` and `stakingByMiningAddress` public mappings.
     * @param _miningAddress The mining address of the newly created pool. Cannot be equal to the `_stakingAddress` and should never be used as a pool before.
     * @param _stakingAddress The staking address of the newly created pool. Cannot be equal to the `_miningAddress` and should never be used as a pool before.
     */
    setStakingAddress(
      _miningAddress: string,
      _stakingAddress: string
    ): NonPayableTransactionObject<void>;

    /**
     * Returns a boolean flag indicating whether delegators of the specified pool are currently banned. A validator pool can be banned when they misbehave (see the `_removeMaliciousValidator` function).
     * @param _miningAddress The mining address of the pool.
     */
    areDelegatorsBanned(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    /**
     * Returns the previous validator set (validators' mining addresses array). The array is stored by the `finalizeChange` function when a new staking epoch's validator set is finalized.
     */
    getPreviousValidators(): NonPayableTransactionObject<string[]>;

    /**
     * Returns the current array of pending validators i.e. waiting to be activated in the new epoch The pending array is changed when a validator is removed as malicious or the validator set is updated by the `newValidatorSet` function.
     */
    getPendingValidators(): NonPayableTransactionObject<string[]>;

    /**
     * Returns the current validator set (an array of mining addresses) which always matches the validator set kept in validator's node.
     */
    getValidators(): NonPayableTransactionObject<string[]>;

    /**
     * Returns a boolean flag indicating if the `initialize` function has been called.
     */
    isInitialized(): NonPayableTransactionObject<boolean>;

    /**
     * Returns a boolean flag indicating whether the specified validator (mining address) is able to call the `reportMalicious` function or whether the specified validator (mining address) can be reported as malicious. This function also allows a validator to call the `reportMalicious` function several blocks after ceasing to be a validator. This is possible if a validator did not have the opportunity to call the `reportMalicious` function prior to the engine calling the `finalizeChange` function.
     * @param _miningAddress The validator's mining address.
     */
    isReportValidatorValid(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    getPendingValidatorKeyGenerationMode(
      _miningAddress: string
    ): NonPayableTransactionObject<string>;

    /**
     * Returns a boolean flag indicating whether the specified mining address is currently banned. A validator can be banned when they misbehave (see the `_removeMaliciousValidator` internal function).
     * @param _miningAddress The mining address.
     */
    isValidatorBanned(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    /**
     * Returns a boolean flag indicating whether the specified mining address is a validator or is in the `_pendingValidators`. Used by the `StakingHbbft.maxWithdrawAllowed` and `StakingHbbft.maxWithdrawOrderAllowed` getters.
     * @param _miningAddress The mining address.
     */
    isValidatorOrPending(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    /**
     * Returns a boolean flag indicating whether the specified mining address is a pending validator. Used by the `isValidatorOrPending` and `KeyGenHistory.writeAck/Part` functions.
     * @param _miningAddress The mining address.
     */
    isPendingValidator(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    /**
     * Returns an array of the validators (their mining addresses) which reported that the specified malicious validator misbehaved at the specified block.
     * @param _blockNumber The block number.
     * @param _miningAddress The mining address of malicious validator.
     */
    maliceReportedForBlock(
      _miningAddress: string,
      _blockNumber: number | string | BN
    ): NonPayableTransactionObject<string[]>;

    /**
     * Returns if the specified _miningAddress is able to announce availability.
     * @param _miningAddress mining address that is allowed/disallowed.
     */
    canCallAnnounceAvailability(
      _miningAddress: string
    ): NonPayableTransactionObject<boolean>;

    /**
     * Returns whether the `reportMalicious` function can be called by the specified validator with the given parameters. Used by the `reportMalicious` function and `TxPermission` contract. Also, returns a boolean flag indicating whether the reporting validator should be removed as malicious due to excessive reporting during the current staking epoch.
     * @param _blockNumber The block number which is passed to the `reportMalicious` function.
     * @param _maliciousMiningAddress The mining address of the malicious validator which is passed to the `reportMalicious` function.
     * @param _reportingMiningAddress The mining address of the reporting validator which is calling the `reportMalicious` function.
     * @returns `bool callable` - The boolean flag indicating whether the `reportMalicious` function can be called at the moment. `bool removeReportingValidator` - The boolean flag indicating whether the reporting validator should be removed as malicious due to excessive reporting. This flag is only used by the `reportMalicious` function.
     */
    reportMaliciousCallable(
      _reportingMiningAddress: string,
      _maliciousMiningAddress: string,
      _blockNumber: number | string | BN
    ): NonPayableTransactionObject<{
      callable: boolean;
      removeReportingValidator: boolean;
      0: boolean;
      1: boolean;
    }>;

    /**
     * Returns the public key for the given stakingAddress
     * @param _stakingAddress staking address of the wanted public key.
     * @returns public key of the _stakingAddress
     */
    publicKeyByStakingAddress(
      _stakingAddress: string
    ): NonPayableTransactionObject<string>;

    /**
     * Returns the public key for the given miningAddress
     * @param _miningAddress mining address of the wanted public key.
     * @returns public key of the _miningAddress
     */
    getPublicKey(_miningAddress: string): NonPayableTransactionObject<string>;
  };
  events: {
    ReportedMalicious(cb?: Callback<ReportedMalicious>): EventEmitter;
    ReportedMalicious(
      options?: EventOptions,
      cb?: Callback<ReportedMalicious>
    ): EventEmitter;

    ValidatorAvailable(cb?: Callback<ValidatorAvailable>): EventEmitter;
    ValidatorAvailable(
      options?: EventOptions,
      cb?: Callback<ValidatorAvailable>
    ): EventEmitter;

    ValidatorUnavailable(cb?: Callback<ValidatorUnavailable>): EventEmitter;
    ValidatorUnavailable(
      options?: EventOptions,
      cb?: Callback<ValidatorUnavailable>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "ReportedMalicious", cb: Callback<ReportedMalicious>): void;
  once(
    event: "ReportedMalicious",
    options: EventOptions,
    cb: Callback<ReportedMalicious>
  ): void;

  once(event: "ValidatorAvailable", cb: Callback<ValidatorAvailable>): void;
  once(
    event: "ValidatorAvailable",
    options: EventOptions,
    cb: Callback<ValidatorAvailable>
  ): void;

  once(event: "ValidatorUnavailable", cb: Callback<ValidatorUnavailable>): void;
  once(
    event: "ValidatorUnavailable",
    options: EventOptions,
    cb: Callback<ValidatorUnavailable>
  ): void;
}
