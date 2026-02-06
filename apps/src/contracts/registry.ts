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
    contractId: "CAYHF7YE6JIQYWJPXCJO6KAJVFPFYHNERIU5IYUR3VGRZQTEI4D6SQRZ",
  }
} as const


/**
 * Registered RWA asset
 */
export interface RWAAsset {
  asset_type: AssetType;
  is_active: boolean;
  max_order_size: i128;
  min_trade_size: i128;
  symbol: string;
  token_address: string;
}

/**
 * RWA Asset type classification
 */
export enum AssetType {
  TreasuryBond = 0,
  CorporateBond = 1,
  MunicipalBond = 2,
  Equity = 3,
  RealEstate = 4,
  Commodity = 5,
  Other = 6,
}


/**
 * Whitelisted participant information
 */
export interface Participant {
  category: ParticipantCategory;
  id_hash: Buffer;
  is_active: boolean;
  kyc_expiry: u64;
  trading_address: string;
  tree_index: u32;
}

export const RegistryError = {
  1: {message:"OnlyAdmin"},
  2: {message:"ParticipantAlreadyExists"},
  3: {message:"ParticipantNotFound"},
  4: {message:"AssetAlreadyExists"},
  5: {message:"AssetNotFound"},
  6: {message:"TreeAtCapacity"},
  7: {message:"InvalidKYCExpiry"},
  8: {message:"ParticipantNotActive"},
  9: {message:"AssetNotActive"}
}

/**
 * Participant category for institutional classification
 */
export enum ParticipantCategory {
  BrokerDealer = 0,
  AssetManager = 1,
  Bank = 2,
  InsuranceCompany = 3,
  PensionFund = 4,
  HedgeFund = 5,
  SovereignWealth = 6,
  Other = 7,
}

export interface Client {
  /**
   * Construct and simulate a get_admin transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the admin address
   */
  get_admin: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a get_asset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific asset by token address
   */
  get_asset: ({token_address}: {token_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<RWAAsset>>>

  /**
   * Construct and simulate a get_assets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all registered assets
   */
  get_assets: (options?: MethodOptions) => Promise<AssembledTransaction<Array<RWAAsset>>>

  /**
   * Construct and simulate a get_verifier transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the verifier contract address
   */
  get_verifier: (options?: MethodOptions) => Promise<AssembledTransaction<string>>

  /**
   * Construct and simulate a register_asset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a new RWA asset
   * 
   * # Arguments
   * * `admin` - Must be the admin address
   * * `asset` - Asset details to register
   */
  register_asset: ({admin, asset}: {admin: string, asset: RWAAsset}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_participant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get a specific participant by trading address
   */
  get_participant: ({trading_address}: {trading_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Option<Participant>>>

  /**
   * Construct and simulate a deactivate_asset transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deactivate an RWA asset
   */
  deactivate_asset: ({admin, token_address}: {admin: string, token_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_participants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all registered participants
   */
  get_participants: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Participant>>>

  /**
   * Construct and simulate a get_active_assets transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get active assets only
   */
  get_active_assets: (options?: MethodOptions) => Promise<AssembledTransaction<Array<RWAAsset>>>

  /**
   * Construct and simulate a is_asset_eligible transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if an asset is eligible for trading
   */
  is_asset_eligible: ({token_address}: {token_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

  /**
   * Construct and simulate a get_whitelist_root transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the current whitelist Merkle root
   */
  get_whitelist_root: (options?: MethodOptions) => Promise<AssembledTransaction<Buffer>>

  /**
   * Construct and simulate a get_whitelist_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the number of participants in the whitelist tree
   */
  get_whitelist_count: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a get_whitelist_depth transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get the whitelist tree depth
   */
  get_whitelist_depth: (options?: MethodOptions) => Promise<AssembledTransaction<u32>>

  /**
   * Construct and simulate a register_participant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Register a new participant in the whitelist
   * 
   * # Arguments
   * * `admin` - Must be the admin address
   * * `participant` - Participant details to register
   * 
   * # Returns
   * * The tree index where the participant was added
   */
  register_participant: ({admin, participant}: {admin: string, participant: Participant}, options?: MethodOptions) => Promise<AssembledTransaction<Result<u32>>>

  /**
   * Construct and simulate a deactivate_participant transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Deactivate a participant (soft delete)
   * 
   * # Arguments
   * * `admin` - Must be the admin address
   * * `trading_address` - Address of the participant to deactivate
   */
  deactivate_participant: ({admin, trading_address}: {admin: string, trading_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<Result<void>>>

  /**
   * Construct and simulate a get_active_participants transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get active participants only
   */
  get_active_participants: (options?: MethodOptions) => Promise<AssembledTransaction<Array<Participant>>>

  /**
   * Construct and simulate a is_participant_eligible transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if a participant is eligible (active and KYC not expired)
   */
  is_participant_eligible: ({trading_address}: {trading_address: string}, options?: MethodOptions) => Promise<AssembledTransaction<boolean>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
        /** Constructor/Initialization Args for the contract's `__constructor` method */
        {admin, verifier_address, eligibility_vk_bytes}: {admin: string, verifier_address: string, eligibility_vk_bytes: Buffer},
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
    return ContractClient.deploy({admin, verifier_address, eligibility_vk_bytes}, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAABRSZWdpc3RlcmVkIFJXQSBhc3NldAAAAAAAAAAIUldBQXNzZXQAAAAGAAAAAAAAAAphc3NldF90eXBlAAAAAAfQAAAACUFzc2V0VHlwZQAAAAAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAObWF4X29yZGVyX3NpemUAAAAAAAsAAAAAAAAADm1pbl90cmFkZV9zaXplAAAAAAALAAAAAAAAAAZzeW1ib2wAAAAAABEAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAAT",
        "AAAAAwAAAB1SV0EgQXNzZXQgdHlwZSBjbGFzc2lmaWNhdGlvbgAAAAAAAAAAAAAJQXNzZXRUeXBlAAAAAAAABwAAAAAAAAAMVHJlYXN1cnlCb25kAAAAAAAAAAAAAAANQ29ycG9yYXRlQm9uZAAAAAAAAAEAAAAAAAAADU11bmljaXBhbEJvbmQAAAAAAAACAAAAAAAAAAZFcXVpdHkAAAAAAAMAAAAAAAAAClJlYWxFc3RhdGUAAAAAAAQAAAAAAAAACUNvbW1vZGl0eQAAAAAAAAUAAAAAAAAABU90aGVyAAAAAAAABg==",
        "AAAAAQAAACNXaGl0ZWxpc3RlZCBwYXJ0aWNpcGFudCBpbmZvcm1hdGlvbgAAAAAAAAAAC1BhcnRpY2lwYW50AAAAAAYAAAAAAAAACGNhdGVnb3J5AAAH0AAAABNQYXJ0aWNpcGFudENhdGVnb3J5AAAAAAAAAAAHaWRfaGFzaAAAAAPuAAAAIAAAAAAAAAAJaXNfYWN0aXZlAAAAAAAAAQAAAAAAAAAKa3ljX2V4cGlyeQAAAAAABgAAAAAAAAAPdHJhZGluZ19hZGRyZXNzAAAAABMAAAAAAAAACnRyZWVfaW5kZXgAAAAAAAQ=",
        "AAAABAAAAAAAAAAAAAAADVJlZ2lzdHJ5RXJyb3IAAAAAAAAJAAAAAAAAAAlPbmx5QWRtaW4AAAAAAAABAAAAAAAAABhQYXJ0aWNpcGFudEFscmVhZHlFeGlzdHMAAAACAAAAAAAAABNQYXJ0aWNpcGFudE5vdEZvdW5kAAAAAAMAAAAAAAAAEkFzc2V0QWxyZWFkeUV4aXN0cwAAAAAABAAAAAAAAAANQXNzZXROb3RGb3VuZAAAAAAAAAUAAAAAAAAADlRyZWVBdENhcGFjaXR5AAAAAAAGAAAAAAAAABBJbnZhbGlkS1lDRXhwaXJ5AAAABwAAAAAAAAAUUGFydGljaXBhbnROb3RBY3RpdmUAAAAIAAAAAAAAAA5Bc3NldE5vdEFjdGl2ZQAAAAAACQ==",
        "AAAAAAAAABVHZXQgdGhlIGFkbWluIGFkZHJlc3MAAAAAAAAJZ2V0X2FkbWluAAAAAAAAAAAAAAEAAAAT",
        "AAAAAAAAACVHZXQgYSBzcGVjaWZpYyBhc3NldCBieSB0b2tlbiBhZGRyZXNzAAAAAAAACWdldF9hc3NldAAAAAAAAAEAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAQAAA+gAAAfQAAAACFJXQUFzc2V0",
        "AAAAAwAAADVQYXJ0aWNpcGFudCBjYXRlZ29yeSBmb3IgaW5zdGl0dXRpb25hbCBjbGFzc2lmaWNhdGlvbgAAAAAAAAAAAAATUGFydGljaXBhbnRDYXRlZ29yeQAAAAAIAAAAAAAAAAxCcm9rZXJEZWFsZXIAAAAAAAAAAAAAAAxBc3NldE1hbmFnZXIAAAABAAAAAAAAAARCYW5rAAAAAgAAAAAAAAAQSW5zdXJhbmNlQ29tcGFueQAAAAMAAAAAAAAAC1BlbnNpb25GdW5kAAAAAAQAAAAAAAAACUhlZGdlRnVuZAAAAAAAAAUAAAAAAAAAD1NvdmVyZWlnbldlYWx0aAAAAAAGAAAAAAAAAAVPdGhlcgAAAAAAAAc=",
        "AAAAAAAAABlHZXQgYWxsIHJlZ2lzdGVyZWQgYXNzZXRzAAAAAAAACmdldF9hc3NldHMAAAAAAAAAAAABAAAD6gAAB9AAAAAIUldBQXNzZXQ=",
        "AAAAAAAAACFHZXQgdGhlIHZlcmlmaWVyIGNvbnRyYWN0IGFkZHJlc3MAAAAAAAAMZ2V0X3ZlcmlmaWVyAAAAAAAAAAEAAAAT",
        "AAAAAAAAAPBJbml0aWFsaXplIHRoZSByZWdpc3RyeSBjb250cmFjdAoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gQWRtaW4gYWRkcmVzcyB3aXRoIG1hbmFnZW1lbnQgcHJpdmlsZWdlcwoqIGB2ZXJpZmllcl9hZGRyZXNzYCAtIEFkZHJlc3Mgb2YgdGhlIEdyb3RoMTYgdmVyaWZpZXIgY29udHJhY3QKKiBgZWxpZ2liaWxpdHlfdmtfYnl0ZXNgIC0gU2VyaWFsaXplZCB2ZXJpZmljYXRpb24ga2V5IGZvciBlbGlnaWJpbGl0eSBwcm9vZnMAAAANX19jb25zdHJ1Y3RvcgAAAAAAAAMAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAQdmVyaWZpZXJfYWRkcmVzcwAAABMAAAAAAAAAFGVsaWdpYmlsaXR5X3ZrX2J5dGVzAAAADgAAAAA=",
        "AAAAAAAAAHFSZWdpc3RlciBhIG5ldyBSV0EgYXNzZXQKCiMgQXJndW1lbnRzCiogYGFkbWluYCAtIE11c3QgYmUgdGhlIGFkbWluIGFkZHJlc3MKKiBgYXNzZXRgIC0gQXNzZXQgZGV0YWlscyB0byByZWdpc3RlcgAAAAAAAA5yZWdpc3Rlcl9hc3NldAAAAAAAAgAAAAAAAAAFYWRtaW4AAAAAAAATAAAAAAAAAAVhc3NldAAAAAAAB9AAAAAIUldBQXNzZXQAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAC1HZXQgYSBzcGVjaWZpYyBwYXJ0aWNpcGFudCBieSB0cmFkaW5nIGFkZHJlc3MAAAAAAAAPZ2V0X3BhcnRpY2lwYW50AAAAAAEAAAAAAAAAD3RyYWRpbmdfYWRkcmVzcwAAAAATAAAAAQAAA+gAAAfQAAAAC1BhcnRpY2lwYW50AA==",
        "AAAAAAAAABdEZWFjdGl2YXRlIGFuIFJXQSBhc3NldAAAAAAQZGVhY3RpdmF0ZV9hc3NldAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAANdG9rZW5fYWRkcmVzcwAAAAAAABMAAAABAAAD6QAAAAIAAAfQAAAADVJlZ2lzdHJ5RXJyb3IAAAA=",
        "AAAAAAAAAB9HZXQgYWxsIHJlZ2lzdGVyZWQgcGFydGljaXBhbnRzAAAAABBnZXRfcGFydGljaXBhbnRzAAAAAAAAAAEAAAPqAAAH0AAAAAtQYXJ0aWNpcGFudAA=",
        "AAAAAAAAABZHZXQgYWN0aXZlIGFzc2V0cyBvbmx5AAAAAAARZ2V0X2FjdGl2ZV9hc3NldHMAAAAAAAAAAAAAAQAAA+oAAAfQAAAACFJXQUFzc2V0",
        "AAAAAAAAAClDaGVjayBpZiBhbiBhc3NldCBpcyBlbGlnaWJsZSBmb3IgdHJhZGluZwAAAAAAABFpc19hc3NldF9lbGlnaWJsZQAAAAAAAAEAAAAAAAAADXRva2VuX2FkZHJlc3MAAAAAAAATAAAAAQAAAAE=",
        "AAAAAAAAACVHZXQgdGhlIGN1cnJlbnQgd2hpdGVsaXN0IE1lcmtsZSByb290AAAAAAAAEmdldF93aGl0ZWxpc3Rfcm9vdAAAAAAAAAAAAAEAAAPuAAAAIA==",
        "AAAAAAAAADRHZXQgdGhlIG51bWJlciBvZiBwYXJ0aWNpcGFudHMgaW4gdGhlIHdoaXRlbGlzdCB0cmVlAAAAE2dldF93aGl0ZWxpc3RfY291bnQAAAAAAAAAAAEAAAAE",
        "AAAAAAAAABxHZXQgdGhlIHdoaXRlbGlzdCB0cmVlIGRlcHRoAAAAE2dldF93aGl0ZWxpc3RfZGVwdGgAAAAAAAAAAAEAAAAE",
        "AAAAAAAAAMxSZWdpc3RlciBhIG5ldyBwYXJ0aWNpcGFudCBpbiB0aGUgd2hpdGVsaXN0CgojIEFyZ3VtZW50cwoqIGBhZG1pbmAgLSBNdXN0IGJlIHRoZSBhZG1pbiBhZGRyZXNzCiogYHBhcnRpY2lwYW50YCAtIFBhcnRpY2lwYW50IGRldGFpbHMgdG8gcmVnaXN0ZXIKCiMgUmV0dXJucwoqIFRoZSB0cmVlIGluZGV4IHdoZXJlIHRoZSBwYXJ0aWNpcGFudCB3YXMgYWRkZWQAAAAUcmVnaXN0ZXJfcGFydGljaXBhbnQAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAC3BhcnRpY2lwYW50AAAAB9AAAAALUGFydGljaXBhbnQAAAAAAQAAA+kAAAAEAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAAJhEZWFjdGl2YXRlIGEgcGFydGljaXBhbnQgKHNvZnQgZGVsZXRlKQoKIyBBcmd1bWVudHMKKiBgYWRtaW5gIC0gTXVzdCBiZSB0aGUgYWRtaW4gYWRkcmVzcwoqIGB0cmFkaW5nX2FkZHJlc3NgIC0gQWRkcmVzcyBvZiB0aGUgcGFydGljaXBhbnQgdG8gZGVhY3RpdmF0ZQAAABZkZWFjdGl2YXRlX3BhcnRpY2lwYW50AAAAAAACAAAAAAAAAAVhZG1pbgAAAAAAABMAAAAAAAAAD3RyYWRpbmdfYWRkcmVzcwAAAAATAAAAAQAAA+kAAAACAAAH0AAAAA1SZWdpc3RyeUVycm9yAAAA",
        "AAAAAAAAABxHZXQgYWN0aXZlIHBhcnRpY2lwYW50cyBvbmx5AAAAF2dldF9hY3RpdmVfcGFydGljaXBhbnRzAAAAAAAAAAABAAAD6gAAB9AAAAALUGFydGljaXBhbnQA",
        "AAAAAAAAAD9DaGVjayBpZiBhIHBhcnRpY2lwYW50IGlzIGVsaWdpYmxlIChhY3RpdmUgYW5kIEtZQyBub3QgZXhwaXJlZCkAAAAAF2lzX3BhcnRpY2lwYW50X2VsaWdpYmxlAAAAAAEAAAAAAAAAD3RyYWRpbmdfYWRkcmVzcwAAAAATAAAAAQAAAAE=" ]),
      options
    )
  }
  public readonly fromJSON = {
    get_admin: this.txFromJSON<string>,
        get_asset: this.txFromJSON<Option<RWAAsset>>,
        get_assets: this.txFromJSON<Array<RWAAsset>>,
        get_verifier: this.txFromJSON<string>,
        register_asset: this.txFromJSON<Result<void>>,
        get_participant: this.txFromJSON<Option<Participant>>,
        deactivate_asset: this.txFromJSON<Result<void>>,
        get_participants: this.txFromJSON<Array<Participant>>,
        get_active_assets: this.txFromJSON<Array<RWAAsset>>,
        is_asset_eligible: this.txFromJSON<boolean>,
        get_whitelist_root: this.txFromJSON<Buffer>,
        get_whitelist_count: this.txFromJSON<u32>,
        get_whitelist_depth: this.txFromJSON<u32>,
        register_participant: this.txFromJSON<Result<u32>>,
        deactivate_participant: this.txFromJSON<Result<void>>,
        get_active_participants: this.txFromJSON<Array<Participant>>,
        is_participant_eligible: this.txFromJSON<boolean>
  }
}