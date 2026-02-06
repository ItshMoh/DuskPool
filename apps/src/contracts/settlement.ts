import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDZAJLQP5EMAMPVAZOF3AUF3S6PL7TSADHA6Y75NAL7XA72MLTNDAULR",
  }
} as const


/**
 * Escrow balance for a participant and asset
 */
export interface EscrowKey {
  asset: string;
  participant: string;
}

export const SettlementError = {
  1: {message:"OnlyAdmin"},
  2: {message:"InsufficientBalance"},
  3: {message:"InsufficientEscrow"},
  4: {message:"NullifierUsed"},
  5: {message:"InvalidProof"},
  6: {message:"WhitelistRootMismatch"},
  7: {message:"AssetNotEligible"},
  8: {message:"ParticipantNotEligible"},
  9: {message:"MatchNotFound"},
  10: {message:"AlreadySettled"},
  11: {message:"InsufficientLockedFunds"},
  12: {message:"TransferFailed"}
}


/**
 * Settlement record for completed trades
 */
export interface SettlementRecord {
  asset_address: string;
  buyer: string;
  match_id: Buffer;
  nullifier: Buffer;
  price: i128;
  quantity: i128;
  seller: string;
  timestamp: u64;
}

export interface Client {
  /**
   * Construct and simulate a deposit transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deposit tokens into escrow
   * 
   * # Arguments
   * * `depositor` - Address of the depositor (must authenticate)
   * * `asset_address` - Token contract address
   * * `amount` - Amount to deposit
   */
  deposit: ({depositor, asset_address, amount}: {depositor: string, asset_address: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw tokens from escrow
   * 
   * # Arguments
   * * `withdrawer` - Address of the withdrawer (must authenticate)
   * * `asset_address` - Token contract address
   * * `amount` - Amount to withdraw
   */
  withdraw: ({withdrawer, asset_address, amount}: {withdrawer: string, asset_address: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<i128>>>

  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get admin address
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a lock_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Lock escrow for a pending order
   * 
   * # Arguments
   * * `trader` - Address of the trader
   * * `asset_address` - Token contract address
   * * `amount` - Amount to lock
   */
  lock_escrow: ({trader, asset_address, amount}: {trader: string, asset_address: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_registry transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get registry address
   */
  get_registry: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_verifier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get verifier address
   */
  get_verifier: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a settle_trade transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * * Settle a matched trade with ZK proof verification
   *      *
   *      * This is the core function that:
   *      * 1. Verifies both parties are on the whitelist via ZK proof
   *      * 2. Verifies the trade details match the commitments
   *      * 3. Checks and marks nullifier to prevent double-settlement
   *      * 4. Executes atomic swap of assets
   *      *
   *      * Circuit public signals format (7 signals):
   *      * [0] buyCommitment - Poseidon hash of buy order
   *      * [1] sellCommitment - Poseidon hash of sell order
   *      * [2] assetHash - Hash of the traded asset
   *      * [3] matchedQuantity - Trade quantity
   *      * [4] executionPrice - Execution price
   *      * [5] whitelistRoot - Merkle root of whitelist (shared)
   *      * [6] nullifierHash - Unique identifier to prevent replay
   *      *
   *      * # Arguments
   *      * * `match_id` - Unique identifier for this match
   *      * * `buyer` - Buyer's address
   *      * * `seller` - Seller's address
   *      * * `asset_address` - The RWA token being traded
   *      * * `payment_asset` - The payment token (e.g., USDC)
   *   
   */
  settle_trade: ({match_id, buyer, seller, asset_address, payment_asset, quantity, price, proof_bytes, pub_signals_bytes}: {match_id: Buffer, buyer: string, seller: string, asset_address: string, payment_asset: string, quantity: i128, price: i128, proof_bytes: Buffer, pub_signals_bytes: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<SettlementRecord>>>

  /**
   * Construct and simulate a unlock_escrow transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Unlock escrow when an order is cancelled
   * 
   * # Arguments
   * * `trader` - Address of the trader
   * * `asset_address` - Token contract address
   * * `amount` - Amount to unlock
   */
  unlock_escrow: ({trader, asset_address, amount}: {trader: string, asset_address: string, amount: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_settlement transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get settlement by match ID
   */
  get_settlement: ({match_id}: {match_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<SettlementRecord>>>

  /**
   * Construct and simulate a get_settlements transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all settlement records
   */
  get_settlements: (options?: MethodOptions) => Promise<AssembledTransaction<Array<SettlementRecord>>>

  /**
   * Construct and simulate a is_nullifier_used transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a nullifier has been used
   */
  is_nullifier_used: ({nullifier}: {nullifier: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_escrow_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get escrow balance for a participant and asset
   */
  get_escrow_balance: ({participant, asset}: {participant: string, asset: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_locked_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get locked balance for a participant and asset
   */
  get_locked_balance: ({participant, asset}: {participant: string, asset: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

  /**
   * Construct and simulate a get_available_balance transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get available (unlocked) balance
   */
  get_available_balance: ({participant, asset}: {participant: string, asset: string}, options?: MethodOptions) => Promise<AssembledTransaction<i128>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, registry_address, verifier_address, settlement_vk_bytes}: {admin: string, registry_address: string, verifier_address: string, settlement_vk_bytes: Buffer},
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy({admin, registry_address, verifier_address, settlement_vk_bytes}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAACpFc2Nyb3cgYmFsYW5jZSBmb3IgYSBwYXJ0aWNpcGFudCBhbmQgYXNzZXQAAAAAAAAAAAAJRXNjcm93S2V5AAAAAAAAAgAAAAAAAAAFYXNzZXQAAAAAAAATAAAAAAAAAAtwYXJ0aWNpcGFudAAAAAAT",
        "AAAABAAAAAAAAAAAAAAAD1NldHRsZW1lbnRFcnJvcgAAAAAMAAAAAAAAAAlPbmx5QWRtaW4AAAAAAAABAAAAAAAAABNJbnN1ZmZpY2llbnRCYWxhbmNlAAAAAAIAAAAAAAAAEkluc3VmZmljaWVudEVzY3JvdwAAAAAAAwAAAAAAAAANTnVsbGlmaWVyVXNlZAAAAAAAAAQAAAAAAAAADEludmFsaWRQcm9vZgAAAAUAAAAAAAAAFVdoaXRlbGlzdFJvb3RNaXNtYXRjaAAAAAAAAAYAAAAAAAAAEEFzc2V0Tm90RWxpZ2libGUAAAAHAAAAAAAAABZQYXJ0aWNpcGFudE5vdEVsaWdpYmxlAAAAAAAIAAAAAAAAAA1NYXRjaE5vdEZvdW5kAAAAAAAACQAAAAAAAAAOQWxyZWFkeVNldHRsZWQAAAAAAAoAAAAAAAAAF0luc3VmZmljaWVudExvY2tlZEZ1bmRzAAAAAAsAAAAAAAAADlRyYW5zZmVyRmFpbGVkAAAAAAAM",
        "AAAAAQAAACZTZXR0bGVtZW50IHJlY29yZCBmb3IgY29tcGxldGVkIHRyYWRlcwAAAAAAAAAAABBTZXR0bGVtZW50UmVjb3JkAAAACAAAAAAAAAANYXNzZXRfYWRkcmVzcwAAAAAAABMAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAIbWF0Y2hfaWQAAAPuAAAAIAAAAAAAAAAJbnVsbGlmaWVyAAAAAAAD7gAAACAAAAAAAAAABXByaWNlAAAAAAAACwAAAAAAAAAIcXVhbnRpdHkAAAALAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAY=",
        "AAAAAAAAAK5EZXBvc2l0IHRva2VucyBpbnRvIGVzY3JvdwoKIyBBcmd1bWVudHMKKiBgZGVwb3NpdG9yYCAtIEFkZHJlc3Mgb2YgdGhlIGRlcG9zaXRvciAobXVzdCBhdXRoZW50aWNhdGUpCiogYGFzc2V0X2FkZHJlc3NgIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzcwoqIGBhbW91bnRgIC0gQW1vdW50IHRvIGRlcG9zaXQAAAAAAAdkZXBvc2l0AAAAAAMAAAAAAAAACWRlcG9zaXRvcgAAAAAAABMAAAAAAAAADWFzc2V0X2FkZHJlc3MAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAsAAAfQAAAAD1NldHRsZW1lbnRFcnJvcgA=",
        "AAAAAAAAALJXaXRoZHJhdyB0b2tlbnMgZnJvbSBlc2Nyb3cKCiMgQXJndW1lbnRzCiogYHdpdGhkcmF3ZXJgIC0gQWRkcmVzcyBvZiB0aGUgd2l0aGRyYXdlciAobXVzdCBhdXRoZW50aWNhdGUpCiogYGFzc2V0X2FkZHJlc3NgIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzcwoqIGBhbW91bnRgIC0gQW1vdW50IHRvIHdpdGhkcmF3AAAAAAAId2l0aGRyYXcAAAADAAAAAAAAAAp3aXRoZHJhd2VyAAAAAAATAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAALAAAH0AAAAA9TZXR0bGVtZW50RXJyb3IA",
        "AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAlnZXRfYWRtaW4AAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAAJZMb2NrIGVzY3JvdyBmb3IgYSBwZW5kaW5nIG9yZGVyCgojIEFyZ3VtZW50cwoqIGB0cmFkZXJgIC0gQWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYGFzc2V0X2FkZHJlc3NgIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzcwoqIGBhbW91bnRgIC0gQW1vdW50IHRvIGxvY2sAAAAAAAtsb2NrX2VzY3JvdwAAAAADAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAADWFzc2V0X2FkZHJlc3MAAAAAAAATAAAAAAAAAAZhbW91bnQAAAAAAAsAAAABAAAD6QAAAAIAAAfQAAAAD1NldHRsZW1lbnRFcnJvcgA=",
        "AAAAAAAAABRHZXQgcmVnaXN0cnkgYWRkcmVzcwAAAAxnZXRfcmVnaXN0cnkAAAAAAAAAAQAAABM=",
        "AAAAAAAAABRHZXQgdmVyaWZpZXIgYWRkcmVzcwAAAAxnZXRfdmVyaWZpZXIAAAAAAAAAAQAAABM=",
        "AAAAAAAABAAqIFNldHRsZSBhIG1hdGNoZWQgdHJhZGUgd2l0aCBaSyBwcm9vZiB2ZXJpZmljYXRpb24KICAgICAqCiAgICAgKiBUaGlzIGlzIHRoZSBjb3JlIGZ1bmN0aW9uIHRoYXQ6CiAgICAgKiAxLiBWZXJpZmllcyBib3RoIHBhcnRpZXMgYXJlIG9uIHRoZSB3aGl0ZWxpc3QgdmlhIFpLIHByb29mCiAgICAgKiAyLiBWZXJpZmllcyB0aGUgdHJhZGUgZGV0YWlscyBtYXRjaCB0aGUgY29tbWl0bWVudHMKICAgICAqIDMuIENoZWNrcyBhbmQgbWFya3MgbnVsbGlmaWVyIHRvIHByZXZlbnQgZG91YmxlLXNldHRsZW1lbnQKICAgICAqIDQuIEV4ZWN1dGVzIGF0b21pYyBzd2FwIG9mIGFzc2V0cwogICAgICoKICAgICAqIENpcmN1aXQgcHVibGljIHNpZ25hbHMgZm9ybWF0ICg3IHNpZ25hbHMpOgogICAgICogWzBdIGJ1eUNvbW1pdG1lbnQgLSBQb3NlaWRvbiBoYXNoIG9mIGJ1eSBvcmRlcgogICAgICogWzFdIHNlbGxDb21taXRtZW50IC0gUG9zZWlkb24gaGFzaCBvZiBzZWxsIG9yZGVyCiAgICAgKiBbMl0gYXNzZXRIYXNoIC0gSGFzaCBvZiB0aGUgdHJhZGVkIGFzc2V0CiAgICAgKiBbM10gbWF0Y2hlZFF1YW50aXR5IC0gVHJhZGUgcXVhbnRpdHkKICAgICAqIFs0XSBleGVjdXRpb25QcmljZSAtIEV4ZWN1dGlvbiBwcmljZQogICAgICogWzVdIHdoaXRlbGlzdFJvb3QgLSBNZXJrbGUgcm9vdCBvZiB3aGl0ZWxpc3QgKHNoYXJlZCkKICAgICAqIFs2XSBudWxsaWZpZXJIYXNoIC0gVW5pcXVlIGlkZW50aWZpZXIgdG8gcHJldmVudCByZXBsYXkKICAgICAqCiAgICAgKiAjIEFyZ3VtZW50cwogICAgICogKiBgbWF0Y2hfaWRgIC0gVW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgbWF0Y2gKICAgICAqICogYGJ1eWVyYCAtIEJ1eWVyJ3MgYWRkcmVzcwogICAgICogKiBgc2VsbGVyYCAtIFNlbGxlcidzIGFkZHJlc3MKICAgICAqICogYGFzc2V0X2FkZHJlc3NgIC0gVGhlIFJXQSB0b2tlbiBiZWluZyB0cmFkZWQKICAgICAqICogYHBheW1lbnRfYXNzZXRgIC0gVGhlIHBheW1lbnQgdG9rZW4gKGUuZy4sIFVTREMpCiAgAAAADHNldHRsZV90cmFkZQAAAAkAAAAAAAAACG1hdGNoX2lkAAAD7gAAACAAAAAAAAAABWJ1eWVyAAAAAAAAEwAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAANcGF5bWVudF9hc3NldAAAAAAAABMAAAAAAAAACHF1YW50aXR5AAAACwAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAAAAAAtwcm9vZl9ieXRlcwAAAAAOAAAAAAAAABFwdWJfc2lnbmFsc19ieXRlcwAAAAAAAA4AAAABAAAD6QAAB9AAAAAQU2V0dGxlbWVudFJlY29yZAAAB9AAAAAPU2V0dGxlbWVudEVycm9yAA==",
        "AAAAAAAAAQ1Jbml0aWFsaXplIHRoZSBzZXR0bGVtZW50IGNvbnRyYWN0CgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBBZG1pbiBhZGRyZXNzCiogYHJlZ2lzdHJ5X2FkZHJlc3NgIC0gQWRkcmVzcyBvZiB0aGUgcmVnaXN0cnkgY29udHJhY3QKKiBgdmVyaWZpZXJfYWRkcmVzc2AgLSBBZGRyZXNzIG9mIHRoZSBHcm90aDE2IHZlcmlmaWVyIGNvbnRyYWN0CiogYHNldHRsZW1lbnRfdmtfYnl0ZXNgIC0gU2VyaWFsaXplZCB2ZXJpZmljYXRpb24ga2V5IGZvciBzZXR0bGVtZW50IHByb29mcwAAAAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAABAAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABByZWdpc3RyeV9hZGRyZXNzAAAAEwAAAAAAAAAQdmVyaWZpZXJfYWRkcmVzcwAAABMAAAAAAAAAE3NldHRsZW1lbnRfdmtfYnl0ZXMAAAAADgAAAAA=",
        "AAAAAAAAAKFVbmxvY2sgZXNjcm93IHdoZW4gYW4gb3JkZXIgaXMgY2FuY2VsbGVkCgojIEFyZ3VtZW50cwoqIGB0cmFkZXJgIC0gQWRkcmVzcyBvZiB0aGUgdHJhZGVyCiogYGFzc2V0X2FkZHJlc3NgIC0gVG9rZW4gY29udHJhY3QgYWRkcmVzcwoqIGBhbW91bnRgIC0gQW1vdW50IHRvIHVubG9jawAAAAAAAA11bmxvY2tfZXNjcm93AAAAAAAAAwAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAGYW1vdW50AAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAA9TZXR0bGVtZW50RXJyb3IA",
        "AAAAAAAAABpHZXQgc2V0dGxlbWVudCBieSBtYXRjaCBJRAAAAAAADmdldF9zZXR0bGVtZW50AAAAAAABAAAAAAAAAAhtYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAAEFNldHRsZW1lbnRSZWNvcmQ=",
        "AAAAAAAAABpHZXQgYWxsIHNldHRsZW1lbnQgcmVjb3JkcwAAAAAAD2dldF9zZXR0bGVtZW50cwAAAAAAAAAAAQAAA+oAAAfQAAAAEFNldHRsZW1lbnRSZWNvcmQ=",
        "AAAAAAAAACJDaGVjayBpZiBhIG51bGxpZmllciBoYXMgYmVlbiB1c2VkAAAAAAARaXNfbnVsbGlmaWVyX3VzZWQAAAAAAAABAAAAAAAAAAludWxsaWZpZXIAAAAAAAPuAAAAIAAAAAEAAAAB",
        "AAAAAAAAAC5HZXQgZXNjcm93IGJhbGFuY2UgZm9yIGEgcGFydGljaXBhbnQgYW5kIGFzc2V0AAAAAAASZ2V0X2VzY3Jvd19iYWxhbmNlAAAAAAACAAAAAAAAAAtwYXJ0aWNpcGFudAAAAAATAAAAAAAAAAVhc3NldAAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAAC5HZXQgbG9ja2VkIGJhbGFuY2UgZm9yIGEgcGFydGljaXBhbnQgYW5kIGFzc2V0AAAAAAASZ2V0X2xvY2tlZF9iYWxhbmNlAAAAAAACAAAAAAAAAAtwYXJ0aWNpcGFudAAAAAATAAAAAAAAAAVhc3NldAAAAAAAABMAAAABAAAACw==",
        "AAAAAAAAACBHZXQgYXZhaWxhYmxlICh1bmxvY2tlZCkgYmFsYW5jZQAAABVnZXRfYXZhaWxhYmxlX2JhbGFuY2UAAAAAAAACAAAAAAAAAAtwYXJ0aWNpcGFudAAAAAATAAAAAAAAAAVhc3NldAAAAAAAABMAAAABAAAACw==" ]),
      options
    )
  }
  public readonly fromJSON = {
    deposit: this.txFromJSON<Result<i128>>,
        withdraw: this.txFromJSON<Result<i128>>,
        get_admin: this.txFromJSON<string>,
        lock_escrow: this.txFromJSON<Result<void>>,
        get_registry: this.txFromJSON<string>,
        get_verifier: this.txFromJSON<string>,
        settle_trade: this.txFromJSON<Result<SettlementRecord>>,
        unlock_escrow: this.txFromJSON<Result<void>>,
        get_settlement: this.txFromJSON<Option<SettlementRecord>>,
        get_settlements: this.txFromJSON<Array<SettlementRecord>>,
        is_nullifier_used: this.txFromJSON<boolean>,
        get_escrow_balance: this.txFromJSON<i128>,
        get_locked_balance: this.txFromJSON<i128>,
        get_available_balance: this.txFromJSON<i128>
  }
}