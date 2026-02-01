# Libraries

Shared Rust libraries for ZK operations using Stellar X-Ray Protocol (Protocol 25).

## X-Ray Protocol

Protocol 25 introduced native cryptographic primitives to Stellar for zero-knowledge applications. This project uses:

- BN254 elliptic curve operations (CAP-0074): `bn254_g1_add`, `bn254_g1_mul`, `bn254_multi_pairing_check`
- Poseidon2 hash function (CAP-0075): ZK-friendly hash over BN254 scalar field

These primitives enable on-chain Groth16 proof verification without external dependencies.

## zk-bn254

Types and utilities for BN254 Groth16 proofs. Provides serialization for verification keys, proofs, and public signals in formats compatible with snarkjs output. Used by the verifier contract to parse and verify proofs.

Key types:
- `VerificationKeyBN254` - Groth16 verification key (alpha, beta, gamma, delta, ic points)
- `ProofBN254` - Groth16 proof (A, B, C points)
- `PublicSignalsBN254` - Public inputs as BN254 field elements

## lean-imt-bn254

Lean Incremental Merkle Tree using Poseidon2 hash on BN254 scalar field. Used by the registry contract to maintain the whitelist Merkle tree. Supports efficient single-leaf insertions without rebuilding the entire tree.

Key features:
- Fixed depth tree (configurable)
- Incremental updates via sparse caching
- Poseidon2 hash for ZK circuit compatibility
