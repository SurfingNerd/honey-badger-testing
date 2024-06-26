/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: iq4msIZjE0iZF6dBIG7Am8JEdR/fzgF/3W2LHRjOxcVZYX6uppD8nZAuOWQHlQ6XBE9uQyiHvDdjfJkGInGHiw==
 */

/* eslint-disable */
// tslint:disable

import DelegateStaker from './delegate_staker'
import Node from './node'

interface StakeDelegators {
  delegator: DelegateStaker['id']
  pool_address: Node['pool_address']
  total_delegated: string
}
export default StakeDelegators;

interface StakeDelegators_InsertParameters {
  delegator: DelegateStaker['id']
  pool_address: Node['pool_address']
  total_delegated: string
}
export type {StakeDelegators_InsertParameters}
