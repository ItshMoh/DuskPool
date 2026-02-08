---
title: "Zero-Knowledge Proofs in RWA Trading"
date: '2026-02-05'
excerpt: "A technical deep-dive into how Duskpool uses ZK proofs to enable private trading of real-world assets."
author: "Duskpool Team"
readTime: "10 min read"
category: "Technical"
thumbnail: "/blog-assets/duskNstellarnew.png"
tags: ["zk-proofs", "cryptography", "technical", "groth16"]
---

# Zero-Knowledge Proofs in RWA Trading

Zero-knowledge proofs allow you to prove something is true without revealing *why* it's true. In the context of trading, this means proving your order is valid without revealing its price, quantity, or direction.

This isn't just a nice-to-have for privacy. It's a fundamental shift in how markets can operate.

## The Core Idea

Consider a simple statement: "I want to buy 100 treasury bills at $98 each."

In a ZK system, you can prove:
- You have sufficient collateral locked
- Your order conforms to protocol rules
- You're authorized to trade (KYC verified)

All without revealing the `100`, the `$98`, or even that you're buying rather than selling.

## The Mathematics

Duskpool uses Groth16 proofs over the BN254 curve—the same proving system used by Ethereum's zkSync and Polygon's zkEVM. The proofs are small (128 bytes) and verification is fast enough for on-chain execution.

### Commitment Scheme

Orders are hidden behind Poseidon hash commitments. Poseidon is a ZK-friendly hash function optimized for arithmetic circuits:

$$
C = \text{Poseidon}(pk, asset\_id, amount, price, side, nonce)
$$

Where:
- $pk$ is the trader's public key
- $asset\_id$ identifies the token pair
- $amount$ is the order quantity
- $price$ is the limit price
- $side \in \{0, 1\}$ indicates buy or sell
- $nonce$ prevents replay attacks

### Match Verification

When two orders potentially match, the ZK circuit verifies:

$$
\text{verify}(C_{buy}, C_{sell}, \pi) =
\begin{cases}
1 & \text{if } price_{buy} \geq price_{sell} \\
0 & \text{otherwise}
\end{cases}
$$

The proof $\pi$ demonstrates the match is valid without revealing the actual prices.

## Circuit Architecture

Our Circom circuits are structured around three main components:

```circom
template OrderCommitment() {
    signal input pk;
    signal input assetId;
    signal input amount;
    signal input price;
    signal input side;  // 0 = buy, 1 = sell
    signal input nonce;

    signal output commitment;

    // Poseidon hash with 6 inputs
    component hasher = Poseidon(6);
    hasher.inputs[0] <== pk;
    hasher.inputs[1] <== assetId;
    hasher.inputs[2] <== amount;
    hasher.inputs[3] <== price;
    hasher.inputs[4] <== side;
    hasher.inputs[5] <== nonce;

    commitment <== hasher.out;
}

template MatchVerifier() {
    signal input buyCommitment;
    signal input sellCommitment;
    signal input buyPrice;
    signal input sellPrice;

    // Verify price compatibility
    signal priceDiff;
    priceDiff <== buyPrice - sellPrice;

    // buyPrice >= sellPrice (difference is non-negative)
    component isValid = GreaterEqThan(64);
    isValid.in[0] <== buyPrice;
    isValid.in[1] <== sellPrice;

    signal output valid;
    valid <== isValid.out;
}
```

## KYC Without Identity Exposure

The KYC system uses Merkle tree inclusion proofs. Authorized traders are added to a whitelist Merkle tree. To trade, you prove your address is in the tree without revealing which leaf you are:

$$
\text{MerkleProof}(leaf, path, root) = 1 \iff leaf \in Tree(root)
$$

This means the protocol knows you're authorized, but on-chain observers can't link your trades to your KYC identity.

## Gas Costs and Verification

On Stellar (via Protocol 25), BN254 operations are native:

| Operation | Gas Cost |
|-----------|----------|
| Poseidon Hash | ~2,000 |
| Groth16 Verify | ~200,000 |
| Full Match Verification | ~250,000 |

This is significantly cheaper than Ethereum L1 verification, making ZK-verified trading economically viable.

## Security Considerations

The security of this system relies on:

1. **Discrete Log Hardness**: Breaking BN254 would require solving ECDLP
2. **Knowledge Soundness**: Groth16 proofs can only be generated with valid witnesses
3. **Collision Resistance**: Poseidon commitments cannot be forged

The trusted setup for our circuits was performed with 50+ participants. Even if all but one colluded, the system remains secure.

## Looking Forward

We're actively exploring:

- **Recursive proofs** for batch settlement (PLONK-based)
- **Threshold FHE** for encrypted order matching
- **Cross-chain bridges** with ZK state verification

The goal is a trading system where privacy is the default, not an afterthought.

---

> For the complete circuit implementations, see our [GitHub repository](https://github.com/duskpool/circuits).
