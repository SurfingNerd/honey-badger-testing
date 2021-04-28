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

export type Upgraded = ContractEventLog<{
  implementation: string;
  0: string;
}>;

export interface BaseUpgradeabilityProxy extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): BaseUpgradeabilityProxy;
  clone(): BaseUpgradeabilityProxy;
  methods: {};
  events: {
    Upgraded(cb?: Callback<Upgraded>): EventEmitter;
    Upgraded(options?: EventOptions, cb?: Callback<Upgraded>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "Upgraded", cb: Callback<Upgraded>): void;
  once(event: "Upgraded", options: EventOptions, cb: Callback<Upgraded>): void;
}
