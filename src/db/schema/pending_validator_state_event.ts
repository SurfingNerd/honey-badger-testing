/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: 3sAbUp69jnAo3YxLybRR+nQGJ3fZ7w+i38lE7ZXnL78rlHz5bDKr8TaHu+GIo8XO4BMol/47NpM/wPQfMwQrkA==
 */

/* eslint-disable */
// tslint:disable

import Headers from './headers'

interface PendingValidatorStateEvent {
  keygen_round: (number) | null
  node: Buffer & {readonly __brand?: 'pending_validator_state_event_node'}
  on_enter_block_number: Headers['block_number']
  on_exit_block_number: (Headers['block_number']) | null
  state: string & {readonly __brand?: 'pending_validator_state_event_state'}
}
export default PendingValidatorStateEvent;

interface PendingValidatorStateEvent_InsertParameters {
  keygen_round?: (number) | null
  node: Buffer & {readonly __brand?: 'pending_validator_state_event_node'}
  on_enter_block_number: Headers['block_number']
  on_exit_block_number?: (Headers['block_number']) | null
  state: string & {readonly __brand?: 'pending_validator_state_event_state'}
}
export type {PendingValidatorStateEvent_InsertParameters}
