/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: i7UUZwvboRHiDaQjgXYNrI3M/v7tGceHY5sUfGGVs5XpOeL4buVQ1MJIIOPt8fcZUuNDTj6ZAUCjgOdSTNQG8Q==
 */

/* eslint-disable */
// tslint:disable

import DelegateStaker from './delegate_staker'
import PosdaoEpoch from './posdao_epoch'

/**
 * rewards from delegate staking
 */
interface DelegateReward {
  id_delegator: DelegateStaker['id']
  id_node: string & {readonly __brand?: 'delegate_reward_id_node'}
  id_posdao_epoch: PosdaoEpoch['id']
  /**
   * @default false
   */
  is_claimed: (boolean) | null
}
export default DelegateReward;

/**
 * rewards from delegate staking
 */
interface DelegateReward_InsertParameters {
  id_delegator: DelegateStaker['id']
  id_node: string & {readonly __brand?: 'delegate_reward_id_node'}
  id_posdao_epoch: PosdaoEpoch['id']
  /**
   * @default false
   */
  is_claimed?: (boolean) | null
}
export type {DelegateReward_InsertParameters}
