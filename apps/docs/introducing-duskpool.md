---
title: "Introducing Duskpool: Private RWA Trading on Stellar"
date: '2026-02-06'
excerpt: "A zero-knowledge dark pool for institutional-grade real-world asset trading on the Stellar network."
author: "Duskpool Team"
readTime: "6 min read"
category: "Protocol"
thumbnail: "/blog-assets/duskNstellarnew.png"
tags: ["announcement", "stellar", "privacy", "rwa"]
---

# Introducing Duskpool

Traditional dark pools solved a real problem: institutional traders needed a way to execute large orders without moving the market against them. But they came with a cost—opacity that bred distrust and, occasionally, abuse.

Duskpool takes the core value proposition of dark pools and rebuilds it with cryptographic guarantees. Every trade is verifiable. Every settlement is atomic. And your order details remain private until execution.

## The Problem with Transparent Markets

When you place a large order on a public order book, you signal your intentions to every other participant. Algorithms front-run your trades. Market makers adjust their quotes. By the time your order fills, you've paid an implicit tax to everyone who saw you coming.

For institutional traders dealing in real-world assets—treasury bills, tokenized real estate, commodity-backed tokens—this information leakage is unacceptable.

## How Duskpool Works

Duskpool uses Protocol 25's zero-knowledge proof capabilities on Stellar to create a trading environment where:

1. **Order Privacy**: Your buy/sell intentions remain hidden until matched
2. **Atomic Settlement**: Trades execute in a single transaction—no counterparty risk
3. **Regulatory Compliance**: KYC verification via Merkle tree proofs, without revealing identity on-chain

The math behind this is elegant. When you place an order, you submit a cryptographic commitment:

$$
C = \text{Poseidon}(asset, amount, price, nonce)
$$

This commitment reveals nothing about your order. But when two orders match, the ZK-verifier contract can confirm validity without exposing the underlying data.

## Settlement Flow

The settlement process uses a matching engine that operates on encrypted order data:

```typescript
interface EncryptedOrder {
  commitment: Field;
  proof: Groth16Proof;
  timestamp: number;
}

// Orders are matched based on commitment compatibility
// without revealing price or quantity
function matchOrders(buy: EncryptedOrder, sell: EncryptedOrder): Match | null {
  // ZK verification ensures orders are valid and compatible
  const isValid = verifyMatchProof(buy.proof, sell.proof);
  if (!isValid) return null;

  return { buyer: buy.commitment, seller: sell.commitment };
}
```

## Supported Assets

At launch, Duskpool supports:

- **US Treasury Bills** (tokenized via regulated issuers)
- **PAXG** (gold-backed tokens)
- **Select Commercial Real Estate** tokens

All assets are issued by partners with proper regulatory frameworks on the Stellar network.

## What's Next

We're building Duskpool in public. The contracts are audited. The matching engine is live on testnet. And we're onboarding our first institutional partners.

If you're interested in trading RWAs with privacy guarantees, [connect your wallet](/trade) and explore the terminal.

---

> Duskpool is currently in testnet. All trades are simulated with test assets.
