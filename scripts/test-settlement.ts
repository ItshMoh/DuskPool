/**
 * Full ZK Settlement Test
 *
 * Tests the complete flow:
 * 1. Generate order commitments for buyer and seller
 * 2. Build whitelist tree
 * 3. Generate settlement proof
 * 4. Output proof bytes for CLI submission
 */

import {
  generateOrderCommitment,
  buildWhitelistTree,
  generateSettlementProof,
  verifyProof,
  OrderSide,
} from "../prover/src/index";
import * as path from "path";
import * as fs from "fs";

// Contract addresses
const CONTRACTS = {
  verifier: "CBSNZSSJ6EEJAEGMGVJHS3JCHQMQMA4COKJ7KE7U6MZGIKVNKOQJFNSJ",
  registry: "CAYHF7YE6JIQYWJPXCJO6KAJVFPFYHNERIU5IYUR3VGRZQTEI4D6SQRZ",
  settlement: "CBD24SR5QAAQOBZ3D56V3NKDHRRGRHO4PZONQ3VNOJF3IDAYEUBC45TJ",
  orderbook: "CA2KQFACY34RAIQTJAKBOGB3UPKPKDSLL2LFVZVQQZC4DPFDFDBW5FIP",
};

// Native XLM SAC (used as payment asset)
const XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Circuit paths
const CIRCUITS_DIR = path.join(__dirname, "../circuits/build");
const WASM_PATH = path.join(CIRCUITS_DIR, "settlement_proof_js/settlement_proof.wasm");
const ZKEY_PATH = path.join(CIRCUITS_DIR, "settlement_proof_final.zkey");
const VK_PATH = path.join(CIRCUITS_DIR, "verification_key.json");

// Output directory
const OUTPUT_DIR = path.join(__dirname, "../test-output");

// Test parameters
const BUYER_ADDRESS = "GAWA7FFL4ETAAHS65SBLK7GIJQSAYONUNQAG63USUUPYIK7EMHO7DQQ6"; // admin
const SELLER_ADDRESS = "GAWA7FFL4ETAAHS65SBLK7GIJQSAYONUNQAG63USUUPYIK7EMHO7DQQ6"; // same for test
const TRADE_QUANTITY = BigInt(100_000_000); // 10 XLM (7 decimals)
const TRADE_PRICE = BigInt(100_000_000); // 10 XLM

async function main() {
  console.log("===========================================");
  console.log("RWA Dark Pool - Full ZK Settlement Test");
  console.log("===========================================\n");

  // Check circuits exist
  if (!fs.existsSync(WASM_PATH) || !fs.existsSync(ZKEY_PATH)) {
    console.error("Circuits not built. Run: cd circuits && follow build steps");
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Step 1: Create mock participants (buyer and seller)
  console.log("Step 1: Setting up participants...");
  const participants = [
    "0x0000000000000000000000000000000000000000000000000000000000000001", // Buyer ID hash
    "0x0000000000000000000000000000000000000000000000000000000000000002", // Seller ID hash
  ];
  console.log("  Buyer ID:  participant[0]");
  console.log("  Seller ID: participant[1]");

  // Step 2: Build whitelist tree
  console.log("\nStep 2: Building whitelist Merkle tree...");
  const { root, proofs } = await buildWhitelistTree(participants);
  console.log("  Whitelist Root:", root.slice(0, 40) + "...");

  const buyerProof = proofs.get(0)!;
  const sellerProof = proofs.get(1)!;
  console.log("  Buyer proof elements:", buyerProof.pathElements.length);
  console.log("  Seller proof elements:", sellerProof.pathElements.length);

  // Step 3: Generate asset hash (mock for XLM)
  console.log("\nStep 3: Computing asset hash...");
  const assetHash = BigInt("0x" + Buffer.from(XLM_SAC).toString("hex").slice(0, 32));
  console.log("  Asset Hash:", assetHash.toString().slice(0, 30) + "...");

  // Step 4: Generate order commitments
  console.log("\nStep 4: Generating order commitments...");

  const buyOrder = await generateOrderCommitment({
    assetHash,
    side: OrderSide.Buy,
    quantity: TRADE_QUANTITY,
    price: TRADE_PRICE,
  });
  console.log("  Buy Order Commitment:", buyOrder.commitment.slice(0, 30) + "...");

  const sellOrder = await generateOrderCommitment({
    assetHash,
    side: OrderSide.Sell,
    quantity: TRADE_QUANTITY,
    price: TRADE_PRICE,
  });
  console.log("  Sell Order Commitment:", sellOrder.commitment.slice(0, 30) + "...");

  // Step 5: Generate settlement proof
  console.log("\nStep 5: Generating ZK settlement proof...");
  console.log("  (This takes 30-60 seconds...)");

  const startTime = Date.now();
  const settlementProof = await generateSettlementProof(
    {
      buyerIdHash: buyerProof.idHash,
      buyerMerkleProof: buyerProof,
      sellerIdHash: sellerProof.idHash,
      sellerMerkleProof: sellerProof,
      buyOrderSecret: buyOrder.secret,
      buyOrderNonce: buyOrder.nonce,
      sellOrderSecret: sellOrder.secret,
      sellOrderNonce: sellOrder.nonce,
      buyCommitment: buyOrder.commitment,
      sellCommitment: sellOrder.commitment,
      assetHash: assetHash.toString(),
      matchedQuantity: TRADE_QUANTITY,
      executionPrice: TRADE_PRICE,
      whitelistRoot: root,
    },
    WASM_PATH,
    ZKEY_PATH
  );
  const elapsed = Date.now() - startTime;
  console.log(`  Proof generated in ${elapsed}ms`);

  // Step 6: Verify proof locally
  console.log("\nStep 6: Verifying proof locally...");
  const valid = await verifyProof(settlementProof.proof, settlementProof.publicSignals, VK_PATH);
  console.log("  Proof valid:", valid);

  if (!valid) {
    console.error("\n❌ Proof verification failed!");
    process.exit(1);
  }

  // Step 7: Save outputs
  console.log("\nStep 7: Saving proof files...");

  // Save proof bytes as hex
  const proofHex = settlementProof.proofBytes.toString("hex");
  fs.writeFileSync(path.join(OUTPUT_DIR, "proof.hex"), proofHex);

  // Save signals bytes as hex
  const signalsHex = settlementProof.signalsBytes.toString("hex");
  fs.writeFileSync(path.join(OUTPUT_DIR, "signals.hex"), signalsHex);

  // Save JSON files for debugging
  fs.writeFileSync(path.join(OUTPUT_DIR, "proof.json"), JSON.stringify(settlementProof.proof, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, "public_signals.json"), JSON.stringify(settlementProof.publicSignals, null, 2));

  // Generate match ID (random 32 bytes)
  const matchId = Buffer.from(Array.from({ length: 32 }, () => Math.floor(Math.random() * 256))).toString("hex");
  fs.writeFileSync(path.join(OUTPUT_DIR, "match_id.hex"), matchId);

  console.log("  Saved to:", OUTPUT_DIR);
  console.log("    - proof.hex");
  console.log("    - signals.hex");
  console.log("    - match_id.hex");
  console.log("    - proof.json");
  console.log("    - public_signals.json");

  // Step 8: Print CLI command
  console.log("\n===========================================");
  console.log("Step 8: Settlement CLI Command");
  console.log("===========================================\n");

  console.log("NOTE: The whitelist root in this proof may not match the on-chain registry.");
  console.log("For a real test, you need to either:");
  console.log("  1. Register participants in the registry with matching ID hashes");
  console.log("  2. Or temporarily modify the settlement contract to skip whitelist check\n");

  console.log("Settlement command (will fail if whitelist root mismatch):\n");
  console.log(`stellar contract invoke \\
  --id ${CONTRACTS.settlement} \\
  --source-account admin \\
  --network testnet \\
  -- \\
  settle_trade \\
  --match_id ${matchId} \\
  --buyer ${BUYER_ADDRESS} \\
  --seller ${SELLER_ADDRESS} \\
  --asset_address ${XLM_SAC} \\
  --payment_asset ${XLM_SAC} \\
  --quantity ${TRADE_QUANTITY} \\
  --price ${TRADE_PRICE} \\
  --proof_bytes ${proofHex} \\
  --pub_signals_bytes ${signalsHex}`);

  console.log("\n===========================================");
  console.log("Public Signals (snarkjs order - output first):");
  console.log("===========================================");
  console.log("[0] nullifierHash:", settlementProof.publicSignals[0]);
  console.log("[1] buyCommitment:", settlementProof.publicSignals[1]);
  console.log("[2] sellCommitment:", settlementProof.publicSignals[2]);
  console.log("[3] assetHash:", settlementProof.publicSignals[3]);
  console.log("[4] matchedQuantity:", settlementProof.publicSignals[4]);
  console.log("[5] executionPrice:", settlementProof.publicSignals[5]);
  console.log("[6] whitelistRoot:", settlementProof.publicSignals[6]);

  console.log("\n✅ Test complete!");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
