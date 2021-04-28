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

export interface IBlockRewardHbbftCoins extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): IBlockRewardHbbftCoins;
  clone(): IBlockRewardHbbftCoins;
  methods: {
    transferReward(
      arg0: number | string | BN,
      arg1: string
    ): NonPayableTransactionObject<void>;

    getDelegatorReward(
      arg0: number | string | BN,
      arg1: number | string | BN,
      arg2: string
    ): NonPayableTransactionObject<string>;

    getValidatorReward(
      arg0: number | string | BN,
      arg1: string
    ): NonPayableTransactionObject<string>;
  };
  events: {
    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };
}
