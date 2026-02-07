# RWA Dark Pool on Stellar

## Executive Summary

We are building a private market for tokenized real‑world assets (RWAs) on Stellar. The system enables compliant institutions to trade without leaking order details to the public network, while still settling on‑chain with cryptographic proof of correctness. We use Stellar’s X‑Ray (Protocol 25) cryptographic primitives to verify zero‑knowledge proofs on‑chain, ensuring that only whitelisted participants can trade and that settlements are valid without exposing sensitive order information.

Our approach combines commitment‑based order entry, off‑chain matching, and on‑chain ZK verification. This unlocks liquidity for regulated assets (bonds, treasuries, funds) while preserving market integrity, minimizing information leakage, and keeping compliance guarantees intact.

## Problem

Institutional RWA trading today faces a structural conflict between transparency and privacy.

**Market leakage**

Public order books reveal order size, price intent, and trading strategy. This exposes participants to front‑running and adverse selection, discourages block trades, and widens spreads.

**Compliance constraints**

RWAs require strict KYC/AML and eligibility controls, yet traditional private venues are closed and slow. Public networks are fast but transparent, creating a compliance vs. privacy trade‑off.

**Operational friction**

Settlement across bilateral agreements is slow, with fragmented custody and weak interoperability. Institutions need programmable settlement that can enforce policy and privacy simultaneously.

A modern RWA market must keep trading details private while preserving provable correctness, regulated access, and on‑chain settlement finality.

## Solution Overview

We provide a private market layer on Stellar for RWA tokens. The system delivers confidentiality and compliance by splitting the workflow into three phases.

**1. Commit**

Traders submit cryptographic commitments of their orders to the on‑chain orderbook. Commitments are binding and hiding, so the market can index orders without revealing price or size.

**2. Match**

An off‑chain matching engine compares full order details privately, identifies compatible trades, and prepares a settlement proposal.

**3. Prove & Settle**

A zero‑knowledge proof is generated to show that both traders are whitelisted and that commitments are consistent with the agreed trade. The settlement contract verifies the proof on‑chain and atomically swaps escrowed assets.

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

Maintains the whitelist of eligible participants and the list of tradable RWA assets. The whitelist is represented as a Merkle tree root, which can be used inside ZK proofs.

**Orderbook contract**

Stores commitment‑only orders. Traders publish commitments and metadata such as asset address and side. No sensitive parameters are revealed.

**Settlement contract**

Holds escrow balances, verifies ZK proofs, enforces anti‑replay via nullifiers, and performs atomic swaps of escrowed assets.

**Verifier contract**

A Groth16 verifier using BN254 pairings, enabled by Stellar X‑Ray primitives.

**Matching engine**

An off‑chain service that receives encrypted order details, matches orders by price‑time priority, and orchestrates proof generation.

**Prover**

Generates ZK proofs that bind commitments, whitelist membership, and trade parameters together.

![alt text](image.png)
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

![alt text](image-1.png)
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
- `π` = Merkle path (private)

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

## What We Enable

**Institutional privacy**

Traders can negotiate and execute without leaking order details to the public network.

**Compliance by design**

Whitelist membership is proven in zero‑knowledge; only eligible participants can settle.

**RWA liquidity**

Private execution enables larger block trades with reduced market impact.

**Atomic on‑chain settlement**

Escrowed assets move only after proof verification, reducing counterparty risk.

**Composable infrastructure**

The system integrates with Stellar’s native assets and token contracts, enabling regulated issuers to list RWAs without building a new chain.

## Trust & Security Assumptions

- Groth16 soundness on BN254.
- Honest whitelist management by the registry admin.
- Off‑chain matching engine cannot force settlement; it only proposes matches.
- On‑chain verification rejects invalid proofs and replayed trades.

## Roadmap (Illustrative)

- **Phase 1:** Testnet contracts, circuits, and prover integration.
- **Phase 2:** Private pilot with whitelisted institutions.
- **Phase 3:** Mainnet deployment and institutional onboarding.

## Glossary

- **RWA:** Real‑world asset such as bonds, treasuries, or fund shares.
- **Commitment:** A hash that binds a value without revealing it.
- **Merkle root:** Compact representation of a whitelist tree.
- **Nullifier:** Unique hash preventing replay of a settlement.
- **Groth16:** Efficient zero‑knowledge proof system.

---
