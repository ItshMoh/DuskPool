---
title: "Duskpool Whitepaper: RWA Dark Pool on Stellar"
excerpt: "A full-stack technical overview of Duskpool’s private RWA trading architecture on Stellar, from commitments to on-chain ZK settlement."
author: "Duskpool Team"
readTime: "8 min read"
category: "Whitepaper"
tags: ["whitepaper", "stellar", "rwa", "privacy", "zk-proofs"]
---

# RWA Dark Pool on Stellar

## Executive Summary

Duskpool is a private trading venue for tokenized real‑world assets (RWAs) on Stellar. It allows compliant institutions to execute large trades without leaking sensitive order details, while still settling on‑chain with cryptographic proof of correctness. The core idea is simple: commitments keep order details hidden, a matching engine finds compatible trades off‑chain, and zero‑knowledge proofs (ZK) allow on‑chain settlement without exposing price, size, or identity.

Our system is built around Stellar’s X‑Ray (Protocol 25) cryptographic primitives. These native primitives make it practical to verify Groth16 proofs on‑chain using BN254 pairings and Poseidon2 hashing, enabling verifiable privacy without requiring a separate chain or trusted middlemen.

This whitepaper explains the full stack: the cryptographic primitives, the ZK circuit design, the smart contract roles, the off‑chain matching and proof generation pipeline, and the trust model that keeps the system robust under adversarial conditions.

## Problem

Institutional RWA trading today faces a structural conflict between transparency and privacy.

**Market leakage**  
> Public order books reveal order size, price intent, and trading strategy. This exposes participants to front‑running and adverse selection, discourages block trades, and widens spreads.

**Compliance constraints**  
> RWAs require strict KYC/AML and eligibility controls, yet traditional private venues are closed and slow. Public networks are fast but transparent, creating a compliance vs. privacy trade‑off.

**Operational friction**  
> Settlement across bilateral agreements is slow, with fragmented custody and weak interoperability. Institutions need programmable settlement that can enforce policy and privacy simultaneously.

A modern RWA market must keep trading details private while preserving provable correctness, regulated access, and on‑chain settlement finality.

## Solution Overview

We provide a private market layer on Stellar for RWA tokens. The system delivers confidentiality and compliance by splitting the workflow into three phases.

**1. Commit**  
> Traders submit cryptographic commitments of their orders to the on‑chain orderbook. Commitments are binding and hiding, so the market can index orders without revealing price or size.

**2. Match**  
> An off‑chain matching engine compares full order details privately, identifies compatible trades, and prepares a settlement proposal.

**3. Prove & Settle**  
> A zero‑knowledge proof is generated to show that both traders are whitelisted and that commitments are consistent with the agreed trade. The settlement contract verifies the proof on‑chain and atomically swaps escrowed assets.

### What’s Public vs Private

| Public | Private |
| :--- | :--- |
| Commitment hashes | Trader identity hashes |
| Asset identifier hash | Order quantity and price |
| Whitelist Merkle root | Nonce/secret values |
| Proof validity | Full match details |
| Settlement execution results | |

This architecture keeps market data private while preserving verifiability and compliance.

## Architecture & Flow

### Components

**Registry contract**  
> Maintains the whitelist of eligible participants and the list of tradable RWA assets. The whitelist is represented as a Merkle tree root, which can be used inside ZK proofs. The contract also stores the verifier address and verification key reference used by settlement.

**Orderbook contract**  
> Stores commitment‑only orders. Traders publish commitments and metadata such as asset address and side. No sensitive parameters are revealed. Matches are recorded so that settlement can be performed later.

**Settlement contract**  
> Holds escrow balances, verifies ZK proofs, enforces anti‑replay via nullifiers, and performs atomic swaps of escrowed assets. It is the final arbiter of whether a trade can settle.

**Verifier contract**  
> A Groth16 verifier using BN254 pairings, enabled by Stellar X‑Ray primitives. It parses the verification key, proof, and public signals and returns a boolean validity result.

**Matching engine**  
> An off‑chain service that receives full order details (encrypted in production), matches orders by price‑time priority, and orchestrates proof generation.

**Prover**  
> Generates ZK proofs that bind commitments, whitelist membership, and trade parameters together in a single settlement proof.

![system overview](/blog-assets/systemoverview.png)

### End‑to‑End Flow

1. **Whitelist & asset registration**
The admin registers participants and assets in the registry. The whitelist root is updated on‑chain.

2. **Escrow funding**
Traders deposit RWA tokens and payment tokens into the settlement contract escrow.

3. **Commitment submission**
Traders submit order commitments to the orderbook contract.

4. **Private matching**
The matching engine receives full order details, matches buy and sell orders, and selects trade terms.

5. **Proof generation**
The prover constructs a ZK proof that:
- Buyer and seller are whitelisted
- Commitments correspond to the matched trade parameters
- The nullifier is correctly computed

6. **On‑chain settlement**
The settlement contract verifies the proof, checks the nullifier has not been used, and atomically swaps escrowed assets.

![data flow](/blog-assets/dataflow.png)

## Stellar X‑Ray Cryptography (Protocol 25)

Protocol 25 introduced native cryptographic primitives to Stellar that make ZK verification practical on‑chain. Duskpool relies on two key primitives.

**BN254 elliptic curve operations (CAP‑0074)**

These enable Groth16 verification directly in smart contracts via:
> - `bn254_g1_add`
> - `bn254_g1_mul`
> - `bn254_multi_pairing_check`

**Poseidon2 hash (CAP‑0075)**

A ZK‑friendly hash over the BN254 scalar field, used both in circuits and on‑chain commitments.

By using these primitives, Duskpool can verify proofs without external dependencies, which keeps settlement deterministic, cheap, and fully on‑chain.

## Mathematical Model

We treat Poseidon and BN254 as primitives provided by Stellar’s X‑Ray cryptographic host functions. We do not derive them; we use them to enforce privacy and correctness.

### 1. Cryptographic Primitives

Poseidon hash (ZK‑friendly, field‑based):

$$
H_P : \mathbb{F}_p^t \to \mathbb{F}_p
$$

BN254 elliptic curve (pairing‑friendly):

$$
E(\mathbb{F}_p): y^2 = x^3 + 3
$$

Bilinear pairing:

$$
e : G_1 \times G_2 \to G_T
$$

### 2. Order Commitment

Each order is encoded into a commitment hash:

$$
C = H_P(a, s, q, p, n, k)
$$

Where:
- `a` = asset hash
- `s` = side (0 = buy, 1 = sell)
- `q` = quantity
- `p` = price
- `n` = nonce
- `k` = secret

This makes the order binding and hiding. Anyone can see `C`, but only the trader can reveal the values that produced it.

### 3. Whitelist Membership (Merkle Proof)

Each participant proves KYC membership without revealing their identity:

$$
R = \mathrm{MerkleRoot}(leaf, \pi)
$$

Where:
- `R` = whitelist root (public)
- `leaf` = participant ID hash
- `\pi` = Merkle path (private)

The proof shows that `leaf` is included in the tree that produced `R`.

### 4. Match Validity

The matching engine enforces compatibility:

$$
p_{\text{buy}} \ge p_{\text{sell}}
$$

$$
p_{\text{exec}} = \frac{p_{\text{buy}} + p_{\text{sell}}}{2}
$$

The execution price is derived from both orders and is included in the proof.

### 5. Nullifier (Anti‑Replay)

To prevent double‑settlement:

$$
N = H_P(C_{\text{buy}}, C_{\text{sell}}, q, k_{\text{buy}} + k_{\text{sell}})
$$

If `N` appears on‑chain more than once, the settlement is rejected.

### 6. Proof Verification (BN254 Pairing)

The on‑chain verifier checks Groth16 validity using BN254 pairings:

$$
e(A, B) \cdot e(-\alpha, \beta) \cdot e\left(-\sum_i x_i \cdot IC_i, \gamma\right) \cdot e(-C, \delta) = 1
$$

This equation validates that the proof corresponds to the stated public signals and is cryptographically sound.

### 7. On‑Chain Escrow Invariants

Escrow balances follow simple accounting constraints:

$$
\mathrm{Escrow} = \mathrm{Deposits} - \mathrm{Withdrawals} - \mathrm{Locked} + \mathrm{Unlocked}
$$

Settlement executes only if balances remain non‑negative:

$$
\mathrm{Seller}(\text{asset}) \ge q
$$

$$
\mathrm{Buyer}(\text{payment}) \ge p_{\text{exec}} \cdot q
$$

## ZK Circuit Design

The settlement circuit proves that a trade is valid without revealing order details. It checks:
> - Both parties are on the whitelist Merkle tree
> - Commitments correspond to the claimed order parameters
> - Trade terms (asset, quantity, price) are consistent
> - A nullifier is computed to prevent replay

### Circuit Public Inputs

These values are visible on‑chain and are used by the verifier:
> - `buyCommitment`
> - `sellCommitment`
> - `assetHash`
> - `matchedQuantity`
> - `executionPrice`
> - `whitelistRoot`

### Circuit Private Inputs

These values are hidden inside the proof:
> - Buyer and seller ID hashes
> - Merkle paths for whitelist membership
> - Order secrets and nonces

### Circuit Capacity

The whitelist Merkle tree depth is 20, supporting up to 1,048,576 participants. This allows large institutional pools without rebuilding the tree.

### Circuit Output

The circuit outputs a nullifier hash. The settlement contract rejects any transaction that reuses the same nullifier, preventing double‑settlement.

## Smart Contract Responsibilities

### Registry Contract

The registry contract is the on‑chain source of truth for eligibility and assets. It:
> - Stores the current whitelist Merkle root
> - Manages participant registration and KYC expiry
> - Manages registered RWA assets
> - Stores the verifier address and eligibility verification key

### Orderbook Contract

The orderbook stores commitments and minimal metadata. It:
> - Accepts commitment submissions
> - Marks orders as matched or cancelled
> - Ensures asset compatibility for matches
> - Records match data for settlement

### Settlement Contract

The settlement contract is the execution layer. It:
> - Holds escrowed assets
> - Verifies ZK proofs for settlement
> - Enforces nullifier uniqueness
> - Swaps assets atomically if proof is valid

### Verifier Contract

The verifier contract is a generic BN254 Groth16 verifier. It:
> - Parses the verification key and proof bytes
> - Applies pairing checks using X‑Ray primitives
> - Returns a boolean validity result

![contract overview](/blog-assets/contractoverview.png)
## Off‑Chain Matching Engine

The matching engine runs off‑chain to find compatible orders while preserving privacy. It:
> - Maintains an in‑memory orderbook per asset
> - Matches orders when `buy price >= sell price`
> - Uses midpoint pricing for execution
> - Supports partial fills
> - Rejects expired orders

In production, order parameters are provided to the matching engine in encrypted form. Only commitments are posted on‑chain, so the public network never sees order details.

## Proof Generation Pipeline

The prover library is responsible for all cryptographic operations required to produce a settlement proof.

### Order Commitment Generation

A trader creates a commitment using Poseidon with the order parameters and a secret nonce. The output is the commitment hash and the secret data needed for later settlement.

### Whitelist Tree Construction

The prover builds a Merkle tree from participant ID hashes and produces Merkle proofs for any participant that will trade.

### Settlement Proof Generation

The settlement proof binds:
> - The buy and sell commitments
> - The whitelist membership proofs
> - The execution price and quantity
> - The nullifier

The output is formatted for Soroban:
> - `proofBytes` (A, B, C points serialized)
> - `signalsBytes` (public signals serialized)

These are passed directly to the settlement contract.

## Operational Notes

### Trusted Setup and Powers of Tau

The Groth16 circuit requires a trusted setup. A Powers of Tau file is used to generate the proving key and verification key. A production setup uses a larger `ptau` file for the full circuit constraints.

### Verification Key Export

The verification key is exported into a hex byte format and deployed to the settlement contract. This ensures that the on‑chain verifier can validate proofs generated by the off‑chain prover.

## Security & Trust Assumptions

The security of the system relies on:
> 1. Groth16 soundness on BN254
> 2. Honest whitelist management by the registry admin
> 3. Off‑chain matching engine cannot force settlement; it only proposes matches
> 4. On‑chain verification rejects invalid proofs and replayed trades

Even if the matching engine is compromised, it cannot settle invalid trades because the settlement contract enforces proof validity and nullifier uniqueness.

## Gas Costs and Verification

On Stellar (via Protocol 25), BN254 operations are native:

| Operation | Gas Cost |
|-----------|----------|
| Poseidon Hash | ~2,000 |
| Groth16 Verify | ~200,000 |
| Full Match Verification | ~250,000 |

This is significantly cheaper than Ethereum L1 verification, making ZK‑verified trading economically viable.

## What We Enable

**Institutional privacy**  
> Traders can negotiate and execute without leaking order details to the public network.

**Compliance by design**  
> Whitelist membership is proven in zero‑knowledge; only eligible participants can settle.

**RWA liquidity**  
> Private execution enables larger block trades with reduced market impact.

**Atomic on‑chain settlement**  
> Escrowed assets move only after proof verification, reducing counterparty risk.

**Composable infrastructure**  
> The system integrates with Stellar’s native assets and token contracts, enabling regulated issuers to list RWAs without building a new chain.

## Looking Forward

We are actively exploring:
> - **Recursive proofs** for batch settlement (PLONK‑based)
> - **Threshold FHE** for encrypted order matching
> - **Cross‑chain bridges** with ZK state verification

The goal is a trading system where privacy is the default, not an afterthought.

---

> For the complete circuit implementations, see our [GitHub repository](https://github.com/duskpool/circuits).
