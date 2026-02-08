FROM node:20-slim

WORKDIR /app

# Copy circuit build artifacts (needed at runtime for proof generation)
COPY circuits/build/settlement_proof_js/settlement_proof.wasm circuits/build/settlement_proof_js/settlement_proof.wasm
COPY circuits/build/settlement_proof_final.zkey circuits/build/settlement_proof_final.zkey

# Build prover first (local dependency)
COPY prover/package.json prover/
RUN cd prover && npm install
COPY prover/ prover/
RUN cd prover && npm run build

# Build matching engine
COPY matching-engine/package.json matching-engine/
RUN cd matching-engine && npm install
COPY matching-engine/ matching-engine/
RUN cd matching-engine && npm run build

EXPOSE 3001

CMD ["node", "matching-engine/dist/server.js"]
