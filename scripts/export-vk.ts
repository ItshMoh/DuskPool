/**
 * Export verification key to Soroban-compatible bytes format
 */
import * as fs from "fs";
import * as path from "path";

const VK_PATH = path.join(__dirname, "../circuits/build/verification_key.json");
const OUTPUT_PATH = path.join(__dirname, "../circuits/build/vk_bytes.hex");

function toBytes32(value: string): string {
  return BigInt(value).toString(16).padStart(64, "0");
}

function g1ToBytes(point: string[]): string {
  const x = toBytes32(point[0]);
  const y = toBytes32(point[1]);
  return x + y;
}

function g2ToBytes(point: string[][]): string {
  // G2 points: [[x0, x1], [y0, y1]] -> x1 || x0 || y1 || y0
  const x1 = toBytes32(point[0][1]);
  const x0 = toBytes32(point[0][0]);
  const y1 = toBytes32(point[1][1]);
  const y0 = toBytes32(point[1][0]);
  return x1 + x0 + y1 + y0;
}

function main() {
  const vk = JSON.parse(fs.readFileSync(VK_PATH, "utf-8"));

  console.log("Verification Key Info:");
  console.log("  Protocol:", vk.protocol);
  console.log("  Curve:", vk.curve);
  console.log("  nPublic:", vk.nPublic);
  console.log("  IC length:", vk.IC.length);

  // Build VK bytes: alpha (64) + beta (128) + gamma (128) + delta (128) + ic_len (4) + IC (64 * n)
  let vkHex = "";

  // Alpha G1 (64 bytes)
  vkHex += g1ToBytes(vk.vk_alpha_1);

  // Beta G2 (128 bytes)
  vkHex += g2ToBytes(vk.vk_beta_2);

  // Gamma G2 (128 bytes)
  vkHex += g2ToBytes(vk.vk_gamma_2);

  // Delta G2 (128 bytes)
  vkHex += g2ToBytes(vk.vk_delta_2);

  // IC length (4 bytes, big-endian)
  const icLen = vk.IC.length;
  vkHex += icLen.toString(16).padStart(8, "0");

  // IC points (64 bytes each)
  for (const ic of vk.IC) {
    vkHex += g1ToBytes(ic);
  }

  console.log("\nVK Bytes:");
  console.log("  Total size:", vkHex.length / 2, "bytes");
  console.log("  Alpha: 64 bytes");
  console.log("  Beta: 128 bytes");
  console.log("  Gamma: 128 bytes");
  console.log("  Delta: 128 bytes");
  console.log("  IC length: 4 bytes");
  console.log("  IC points:", icLen, "x 64 =", icLen * 64, "bytes");

  fs.writeFileSync(OUTPUT_PATH, vkHex);
  console.log("\nWritten to:", OUTPUT_PATH);
  console.log("\nUse with stellar CLI:");
  console.log(`  --settlement_vk_bytes $(cat ${OUTPUT_PATH})`);
}

main();
