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
    contractId: "CA2KQFACY34RAIQTJAKBOGB3UPKPKDSLL2LFVZVQQZC4DPFDFDBW5FIP",
  }
} as const

/**
 * Order side (buy or sell)
 */
export enum OrderSide {
  Buy = 0,
  Sell = 1,
}


/**
 * Matched trade record
 */
export interface MatchRecord {
  asset_address: string;
  buy_commitment: Buffer;
  buyer: string;
  is_settled: boolean;
  match_id: Buffer;
  price: i128;
  quantity: i128;
  sell_commitment: Buffer;
  seller: string;
  timestamp: u64;
}

/**
 * Order status
 */
export enum OrderStatus {
  Active = 0,
  Matched = 1,
  Settled = 2,
  Cancelled = 3,
  Expired = 4,
}

export const OrderbookError = {
  1: {message:"OnlyAdmin"},
  2: {message:"OrderNotFound"},
  3: {message:"OrderExpired"},
  4: {message:"OrderAlreadyMatched"},
  5: {message:"OrderAlreadyCancelled"},
  6: {message:"InvalidProof"},
  7: {message:"UnauthorizedCancellation"},
  8: {message:"MatchNotFound"},
  9: {message:"InvalidOrderSide"},
  10: {message:"AssetMismatch"}
}


/**
 * Order commitment stored in the orderbook
 * The actual order details (quantity, price) are hidden in the commitment
 */
export interface OrderCommitment {
  asset_address: string;
  commitment: Buffer;
  expiry: u64;
  side: OrderSide;
  status: OrderStatus;
  timestamp: u64;
  trader: string;
  tree_index: u32;
}

export interface Client {
  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get admin address
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_match transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific match
   */
  get_match: ({match_id}: {match_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<MatchRecord>>>

  /**
   * Construct and simulate a get_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get an order by commitment
   */
  get_order: ({commitment}: {commitment: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Option<OrderCommitment>>>

  /**
   * Construct and simulate a get_matches transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all matches
   */
  get_matches: (options?: MethodOptions) => Promise<AssembledTransaction<Array<MatchRecord>>>

  /**
   * Construct and simulate a cancel_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Cancel an order with ownership proof
   * 
   * # Arguments
   * * `trader` - Address of the trader (must authenticate)
   * * `commitment` - The order commitment to cancel
   * * `proof_bytes` - ZK proof of order ownership
   * * `pub_signals_bytes` - Public signals for the proof
   */
  cancel_order: ({trader, commitment, proof_bytes, pub_signals_bytes}: {trader: string, commitment: Buffer, proof_bytes: Buffer, pub_signals_bytes: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_registry transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get registry address
   */
  get_registry: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a mark_settled transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Mark a match as settled (called after successful settlement)
   */
  mark_settled: ({admin, match_id}: {admin: string, match_id: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a record_match transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Record a matched trade (called by matching engine)
   * 
   * # Arguments
   * * `admin` - Must be admin
   * * `match_id` - Unique identifier for the match
   * * `buy_commitment` - The buy order commitment
   * * `sell_commitment` - The sell order commitment
   * * `asset_address` - The RWA token being traded
   * * `buyer` - Buyer address
   * * `seller` - Seller address
   * * `quantity` - Matched quantity
   * * `price` - Execution price
   */
  record_match: ({admin, match_id, buy_commitment, sell_commitment, asset_address, buyer, seller, quantity, price}: {admin: string, match_id: Buffer, buy_commitment: Buffer, sell_commitment: Buffer, asset_address: string, buyer: string, seller: string, quantity: i128, price: i128}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a submit_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Submit a new order commitment
   * 
   * # Arguments
   * * `trader` - Address of the trader (must authenticate)
   * * `commitment` - Hash commitment of the order (Poseidon(asset, side, qty, price, nonce, secret))
   * * `asset_address` - The RWA token address (public for matching)
   * * `side` - Buy or Sell (public for matching)
   * * `expiry_seconds` - How many seconds until order expires
   * 
   * # Returns
   * * The index of the order in the orderbook
   */
  submit_order: ({trader, commitment, asset_address, side, expiry_seconds}: {trader: string, commitment: Buffer, asset_address: string, side: OrderSide, expiry_seconds: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a get_settlement transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get settlement address
   */
  get_settlement: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_active_orders transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get active orders only
   */
  get_active_orders: ({asset_address}: {asset_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Array<OrderCommitment>>>

  /**
   * Construct and simulate a get_orders_by_asset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all orders for an asset and side
   */
  get_orders_by_asset: ({asset_address, side}: {asset_address: string, side: Option<OrderSide>}, options?: MethodOptions) => Promise<AssembledTransaction<Array<OrderCommitment>>>

  /**
   * Construct and simulate a get_pending_matches transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get pending (unsettle) matches
   */
  get_pending_matches: (options?: MethodOptions) => Promise<AssembledTransaction<Array<MatchRecord>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, registry_address, settlement_address}: {admin: string, registry_address: string, settlement_address: string},
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
    return ContractClient.deploy({admin, registry_address, settlement_address}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAwAAABhPcmRlciBzaWRlIChidXkgb3Igc2VsbCkAAAAAAAAACU9yZGVyU2lkZQAAAAAAAAIAAAAAAAAAA0J1eQAAAAAAAAAAAAAAAARTZWxsAAAAAQ==",
        "AAAAAQAAABRNYXRjaGVkIHRyYWRlIHJlY29yZAAAAAAAAAALTWF0Y2hSZWNvcmQAAAAACgAAAAAAAAANYXNzZXRfYWRkcmVzcwAAAAAAABMAAAAAAAAADmJ1eV9jb21taXRtZW50AAAAAAPuAAAAIAAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAppc19zZXR0bGVkAAAAAAABAAAAAAAAAAhtYXRjaF9pZAAAA+4AAAAgAAAAAAAAAAVwcmljZQAAAAAAAAsAAAAAAAAACHF1YW50aXR5AAAACwAAAAAAAAAPc2VsbF9jb21taXRtZW50AAAAA+4AAAAgAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAACXRpbWVzdGFtcAAAAAAAAAY=",
        "AAAAAwAAAAxPcmRlciBzdGF0dXMAAAAAAAAAC09yZGVyU3RhdHVzAAAAAAUAAAAAAAAABkFjdGl2ZQAAAAAAAAAAAAAAAAAHTWF0Y2hlZAAAAAABAAAAAAAAAAdTZXR0bGVkAAAAAAIAAAAAAAAACUNhbmNlbGxlZAAAAAAAAAMAAAAAAAAAB0V4cGlyZWQAAAAABA==",
        "AAAABAAAAAAAAAAAAAAADk9yZGVyYm9va0Vycm9yAAAAAAAKAAAAAAAAAAlPbmx5QWRtaW4AAAAAAAABAAAAAAAAAA1PcmRlck5vdEZvdW5kAAAAAAAAAgAAAAAAAAAMT3JkZXJFeHBpcmVkAAAAAwAAAAAAAAATT3JkZXJBbHJlYWR5TWF0Y2hlZAAAAAAEAAAAAAAAABVPcmRlckFscmVhZHlDYW5jZWxsZWQAAAAAAAAFAAAAAAAAAAxJbnZhbGlkUHJvb2YAAAAGAAAAAAAAABhVbmF1dGhvcml6ZWRDYW5jZWxsYXRpb24AAAAHAAAAAAAAAA1NYXRjaE5vdEZvdW5kAAAAAAAACAAAAAAAAAAQSW52YWxpZE9yZGVyU2lkZQAAAAkAAAAAAAAADUFzc2V0TWlzbWF0Y2gAAAAAAAAK",
        "AAAAAQAAAHBPcmRlciBjb21taXRtZW50IHN0b3JlZCBpbiB0aGUgb3JkZXJib29rClRoZSBhY3R1YWwgb3JkZXIgZGV0YWlscyAocXVhbnRpdHksIHByaWNlKSBhcmUgaGlkZGVuIGluIHRoZSBjb21taXRtZW50AAAAAAAAAA9PcmRlckNvbW1pdG1lbnQAAAAACAAAAAAAAAANYXNzZXRfYWRkcmVzcwAAAAAAABMAAAAAAAAACmNvbW1pdG1lbnQAAAAAA+4AAAAgAAAAAAAAAAZleHBpcnkAAAAAAAYAAAAAAAAABHNpZGUAAAfQAAAACU9yZGVyU2lkZQAAAAAAAAAAAAAGc3RhdHVzAAAAAAfQAAAAC09yZGVyU3RhdHVzAAAAAAAAAAAJdGltZXN0YW1wAAAAAAAABgAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAAp0cmVlX2luZGV4AAAAAAAE",
        "AAAAAAAAABFHZXQgYWRtaW4gYWRkcmVzcwAAAAAAAAlnZXRfYWRtaW4AAAAAAAAAAAAAAQAAABM=",
        "AAAAAAAAABRHZXQgYSBzcGVjaWZpYyBtYXRjaAAAAAlnZXRfbWF0Y2gAAAAAAAABAAAAAAAAAAhtYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAAC01hdGNoUmVjb3JkAA==",
        "AAAAAAAAABpHZXQgYW4gb3JkZXIgYnkgY29tbWl0bWVudAAAAAAACWdldF9vcmRlcgAAAAAAAAEAAAAAAAAACmNvbW1pdG1lbnQAAAAAA+4AAAAgAAAAAQAAA+gAAAfQAAAAD09yZGVyQ29tbWl0bWVudAA=",
        "AAAAAAAAAA9HZXQgYWxsIG1hdGNoZXMAAAAAC2dldF9tYXRjaGVzAAAAAAAAAAABAAAD6gAAB9AAAAALTWF0Y2hSZWNvcmQA",
        "AAAAAAAAAPtDYW5jZWwgYW4gb3JkZXIgd2l0aCBvd25lcnNoaXAgcHJvb2YKCiMgQXJndW1lbnRzCiogYHRyYWRlcmAgLSBBZGRyZXNzIG9mIHRoZSB0cmFkZXIgKG11c3QgYXV0aGVudGljYXRlKQoqIGBjb21taXRtZW50YCAtIFRoZSBvcmRlciBjb21taXRtZW50IHRvIGNhbmNlbAoqIGBwcm9vZl9ieXRlc2AgLSBaSyBwcm9vZiBvZiBvcmRlciBvd25lcnNoaXAKKiBgcHViX3NpZ25hbHNfYnl0ZXNgIC0gUHVibGljIHNpZ25hbHMgZm9yIHRoZSBwcm9vZgAAAAAMY2FuY2VsX29yZGVyAAAABAAAAAAAAAAGdHJhZGVyAAAAAAATAAAAAAAAAApjb21taXRtZW50AAAAAAPuAAAAIAAAAAAAAAALcHJvb2ZfYnl0ZXMAAAAADgAAAAAAAAARcHViX3NpZ25hbHNfYnl0ZXMAAAAAAAAOAAAAAQAAA+kAAAACAAAH0AAAAA5PcmRlcmJvb2tFcnJvcgAA",
        "AAAAAAAAABRHZXQgcmVnaXN0cnkgYWRkcmVzcwAAAAxnZXRfcmVnaXN0cnkAAAAAAAAAAQAAABM=",
        "AAAAAAAAADxNYXJrIGEgbWF0Y2ggYXMgc2V0dGxlZCAoY2FsbGVkIGFmdGVyIHN1Y2Nlc3NmdWwgc2V0dGxlbWVudCkAAAAMbWFya19zZXR0bGVkAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAhtYXRjaF9pZAAAA+4AAAAgAAAAAQAAA+kAAAACAAAH0AAAAA5PcmRlcmJvb2tFcnJvcgAA",
        "AAAAAAAAAYdSZWNvcmQgYSBtYXRjaGVkIHRyYWRlIChjYWxsZWQgYnkgbWF0Y2hpbmcgZW5naW5lKQoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gTXVzdCBiZSBhZG1pbgoqIGBtYXRjaF9pZGAgLSBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIG1hdGNoCiogYGJ1eV9jb21taXRtZW50YCAtIFRoZSBidXkgb3JkZXIgY29tbWl0bWVudAoqIGBzZWxsX2NvbW1pdG1lbnRgIC0gVGhlIHNlbGwgb3JkZXIgY29tbWl0bWVudAoqIGBhc3NldF9hZGRyZXNzYCAtIFRoZSBSV0EgdG9rZW4gYmVpbmcgdHJhZGVkCiogYGJ1eWVyYCAtIEJ1eWVyIGFkZHJlc3MKKiBgc2VsbGVyYCAtIFNlbGxlciBhZGRyZXNzCiogYHF1YW50aXR5YCAtIE1hdGNoZWQgcXVhbnRpdHkKKiBgcHJpY2VgIC0gRXhlY3V0aW9uIHByaWNlAAAAAAxyZWNvcmRfbWF0Y2gAAAAJAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAACG1hdGNoX2lkAAAD7gAAACAAAAAAAAAADmJ1eV9jb21taXRtZW50AAAAAAPuAAAAIAAAAAAAAAAPc2VsbF9jb21taXRtZW50AAAAA+4AAAAgAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAACHF1YW50aXR5AAAACwAAAAAAAAAFcHJpY2UAAAAAAAALAAAAAQAAA+kAAAACAAAH0AAAAA5PcmRlcmJvb2tFcnJvcgAA",
        "AAAAAAAAAZ5TdWJtaXQgYSBuZXcgb3JkZXIgY29tbWl0bWVudAoKIyBBcmd1bWVudHMKKiBgdHJhZGVyYCAtIEFkZHJlc3Mgb2YgdGhlIHRyYWRlciAobXVzdCBhdXRoZW50aWNhdGUpCiogYGNvbW1pdG1lbnRgIC0gSGFzaCBjb21taXRtZW50IG9mIHRoZSBvcmRlciAoUG9zZWlkb24oYXNzZXQsIHNpZGUsIHF0eSwgcHJpY2UsIG5vbmNlLCBzZWNyZXQpKQoqIGBhc3NldF9hZGRyZXNzYCAtIFRoZSBSV0EgdG9rZW4gYWRkcmVzcyAocHVibGljIGZvciBtYXRjaGluZykKKiBgc2lkZWAgLSBCdXkgb3IgU2VsbCAocHVibGljIGZvciBtYXRjaGluZykKKiBgZXhwaXJ5X3NlY29uZHNgIC0gSG93IG1hbnkgc2Vjb25kcyB1bnRpbCBvcmRlciBleHBpcmVzCgojIFJldHVybnMKKiBUaGUgaW5kZXggb2YgdGhlIG9yZGVyIGluIHRoZSBvcmRlcmJvb2sAAAAAAAxzdWJtaXRfb3JkZXIAAAAFAAAAAAAAAAZ0cmFkZXIAAAAAABMAAAAAAAAACmNvbW1pdG1lbnQAAAAAA+4AAAAgAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAEc2lkZQAAB9AAAAAJT3JkZXJTaWRlAAAAAAAAAAAAAA5leHBpcnlfc2Vjb25kcwAAAAAABgAAAAEAAAPpAAAABAAAB9AAAAAOT3JkZXJib29rRXJyb3IAAA==",
        "AAAAAAAAALxJbml0aWFsaXplIHRoZSBvcmRlcmJvb2sgY29udHJhY3QKCiMgQXJndW1lbnRzCiogYGFkbWluYCAtIEFkbWluIGFkZHJlc3MKKiBgcmVnaXN0cnlfYWRkcmVzc2AgLSBBZGRyZXNzIG9mIHRoZSByZWdpc3RyeSBjb250cmFjdAoqIGBzZXR0bGVtZW50X2FkZHJlc3NgIC0gQWRkcmVzcyBvZiB0aGUgc2V0dGxlbWVudCBjb250cmFjdAAAAA1fX2NvbnN0cnVjdG9yAAAAAAAAAwAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAABByZWdpc3RyeV9hZGRyZXNzAAAAEwAAAAAAAAASc2V0dGxlbWVudF9hZGRyZXNzAAAAAAATAAAAAA==",
        "AAAAAAAAABZHZXQgc2V0dGxlbWVudCBhZGRyZXNzAAAAAAAOZ2V0X3NldHRsZW1lbnQAAAAAAAAAAAABAAAAEw==",
        "AAAAAAAAABZHZXQgYWN0aXZlIG9yZGVycyBvbmx5AAAAAAARZ2V0X2FjdGl2ZV9vcmRlcnMAAAAAAAABAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAEAAAPqAAAH0AAAAA9PcmRlckNvbW1pdG1lbnQA",
        "AAAAAAAAACRHZXQgYWxsIG9yZGVycyBmb3IgYW4gYXNzZXQgYW5kIHNpZGUAAAATZ2V0X29yZGVyc19ieV9hc3NldAAAAAACAAAAAAAAAA1hc3NldF9hZGRyZXNzAAAAAAAAEwAAAAAAAAAEc2lkZQAAA+gAAAfQAAAACU9yZGVyU2lkZQAAAAAAAAEAAAPqAAAH0AAAAA9PcmRlckNvbW1pdG1lbnQA",
        "AAAAAAAAAB5HZXQgcGVuZGluZyAodW5zZXR0bGUpIG1hdGNoZXMAAAAAABNnZXRfcGVuZGluZ19tYXRjaGVzAAAAAAAAAAABAAAD6gAAB9AAAAALTWF0Y2hSZWNvcmQA" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_admin: this.txFromJSON<string>,
        get_match: this.txFromJSON<Option<MatchRecord>>,
        get_order: this.txFromJSON<Option<OrderCommitment>>,
        get_matches: this.txFromJSON<Array<MatchRecord>>,
        cancel_order: this.txFromJSON<Result<void>>,
        get_registry: this.txFromJSON<string>,
        mark_settled: this.txFromJSON<Result<void>>,
        record_match: this.txFromJSON<Result<void>>,
        submit_order: this.txFromJSON<Result<u32>>,
        get_settlement: this.txFromJSON<string>,
        get_active_orders: this.txFromJSON<Array<OrderCommitment>>,
        get_orders_by_asset: this.txFromJSON<Array<OrderCommitment>>,
        get_pending_matches: this.txFromJSON<Array<MatchRecord>>
  }
}