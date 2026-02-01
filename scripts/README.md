# Scripts

Utility scripts for testing and deployment.

## test-settlement.ts

Full end-to-end ZK settlement test. Generates order commitments, builds a whitelist tree, produces a settlement proof, and outputs the CLI command to execute settlement on testnet.

Run from project root:
```bash
cd scripts
npx ts-node test-settlement.ts
```

Requires circuits to be built first. Output files are saved to `test-output/`.

## export-vk.ts

Exports the verification key from JSON format to hex bytes for the settlement contract. The settlement contract needs the verification key in a specific binary format.

```bash
npx ts-node export-vk.ts
```

Creates `circuits/build/vk_bytes.hex`.
