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
    contractId: "CBSNZSSJ6EEJAEGMGVJHS3JCHQMQMA4COKJ7KE7U6MZGIKVNKOQJFNSJ",
  }
} as const


/**
 * Groth16 Proof for BN254 curve
 */
export interface Proof {
  a: Buffer;
  b: Buffer;
  c: Buffer;
}

export const VerifierError = {
  1: {message:"MalformedVerificationKey"},
  2: {message:"MalformedProof"},
  3: {message:"InvalidPublicSignals"},
  4: {message:"PairingCheckFailed"}
}


/**
 * Groth16 Verification Key for BN254 curve
 */
export interface VerificationKey {
  alpha: Buffer;
  beta: Buffer;
  delta: Buffer;
  gamma: Buffer;
  ic: Array<Buffer>;
}

export interface Client {
  /**
   * Construct and simulate a verify_proof transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verifies a Groth16 proof using BN254 curve
   * 
   * # Arguments
   * * `vk` - The verification key
   * * `proof` - The Groth16 proof (A, B, C points)
   * * `pub_signals` - Public input signals as Fr scalars
   * 
   * # Returns
   * * `true` if the proof is valid, `false` otherwise
   */
  verify_proof: ({vk, proof, pub_signals}: {vk: VerificationKey, proof: Proof, pub_signals: Array<u256>}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

  /**
   * Construct and simulate a verify_proof_bytes transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Verifies a proof from serialized bytes
   * 
   * # Arguments
   * * `vk_bytes` - Serialized verification key
   * * `proof_bytes` - Serialized proof
   * * `pub_signals_bytes` - Serialized public signals
   */
  verify_proof_bytes: ({vk_bytes, proof_bytes, pub_signals_bytes}: {vk_bytes: Buffer, proof_bytes: Buffer, pub_signals_bytes: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<Result<boolean>>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
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
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAB1Hcm90aDE2IFByb29mIGZvciBCTjI1NCBjdXJ2ZQAAAAAAAAAAAAAFUHJvb2YAAAAAAAADAAAAAAAAAAFhAAAAAAAD7gAAAGAAAAAAAAAAAWIAAAAAAAPuAAAAwAAAAAAAAAABYwAAAAAAA+4AAABg",
        "AAAABAAAAAAAAAAAAAAADVZlcmlmaWVyRXJyb3IAAAAAAAAEAAAAAAAAABhNYWxmb3JtZWRWZXJpZmljYXRpb25LZXkAAAABAAAAAAAAAA5NYWxmb3JtZWRQcm9vZgAAAAAAAgAAAAAAAAAUSW52YWxpZFB1YmxpY1NpZ25hbHMAAAADAAAAAAAAABJQYWlyaW5nQ2hlY2tGYWlsZWQAAAAAAAQ=",
        "AAAAAQAAAChHcm90aDE2IFZlcmlmaWNhdGlvbiBLZXkgZm9yIEJOMjU0IGN1cnZlAAAAAAAAAA9WZXJpZmljYXRpb25LZXkAAAAABQAAAAAAAAAFYWxwaGEAAAAAAAPuAAAAYAAAAAAAAAAEYmV0YQAAA+4AAADAAAAAAAAAAAVkZWx0YQAAAAAAA+4AAADAAAAAAAAAAAVnYW1tYQAAAAAAA+4AAADAAAAAAAAAAAJpYwAAAAAD6gAAA+4AAABg",
        "AAAAAAAAAPZWZXJpZmllcyBhIEdyb3RoMTYgcHJvb2YgdXNpbmcgQk4yNTQgY3VydmUKCiMgQXJndW1lbnRzCiogYHZrYCAtIFRoZSB2ZXJpZmljYXRpb24ga2V5CiogYHByb29mYCAtIFRoZSBHcm90aDE2IHByb29mIChBLCBCLCBDIHBvaW50cykKKiBgcHViX3NpZ25hbHNgIC0gUHVibGljIGlucHV0IHNpZ25hbHMgYXMgRnIgc2NhbGFycwoKIyBSZXR1cm5zCiogYHRydWVgIGlmIHRoZSBwcm9vZiBpcyB2YWxpZCwgYGZhbHNlYCBvdGhlcndpc2UAAAAAAAx2ZXJpZnlfcHJvb2YAAAADAAAAAAAAAAJ2awAAAAAH0AAAAA9WZXJpZmljYXRpb25LZXkAAAAAAAAAAAVwcm9vZgAAAAAAB9AAAAAFUHJvb2YAAAAAAAAAAAAAC3B1Yl9zaWduYWxzAAAAA+oAAAAMAAAAAQAAA+kAAAABAAAH0AAAAA1WZXJpZmllckVycm9yAAAA",
        "AAAAAAAAALNWZXJpZmllcyBhIHByb29mIGZyb20gc2VyaWFsaXplZCBieXRlcwoKIyBBcmd1bWVudHMKKiBgdmtfYnl0ZXNgIC0gU2VyaWFsaXplZCB2ZXJpZmljYXRpb24ga2V5CiogYHByb29mX2J5dGVzYCAtIFNlcmlhbGl6ZWQgcHJvb2YKKiBgcHViX3NpZ25hbHNfYnl0ZXNgIC0gU2VyaWFsaXplZCBwdWJsaWMgc2lnbmFscwAAAAASdmVyaWZ5X3Byb29mX2J5dGVzAAAAAAADAAAAAAAAAAh2a19ieXRlcwAAAA4AAAAAAAAAC3Byb29mX2J5dGVzAAAAAA4AAAAAAAAAEXB1Yl9zaWduYWxzX2J5dGVzAAAAAAAADgAAAAEAAAPpAAAAAQAAB9AAAAANVmVyaWZpZXJFcnJvcgAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    verify_proof: this.txFromJSON<Result<boolean>>,
        verify_proof_bytes: this.txFromJSON<Result<boolean>>
  }
}