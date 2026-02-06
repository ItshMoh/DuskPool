// Contract clients
export { Client as SettlementClient, networks as settlementNetworks } from './settlement';
export type { EscrowKey, SettlementRecord, SettlementError } from './settlement';

export { Client as OrderbookClient, networks as orderbookNetworks } from './orderbook';
export type { OrderCommitment, MatchRecord, OrderSide, OrderStatus, OrderbookError } from './orderbook';

export { Client as RegistryClient, networks as registryNetworks } from './registry';
export type { RWAAsset, Participant, AssetType, ParticipantCategory, RegistryError } from './registry';

export { Client as VerifierClient, networks as verifierNetworks } from './verifier';
export type { Proof, VerificationKey } from './verifier';

// Network configuration
export const NETWORK_CONFIG = {
  rpcUrl: 'https://soroban-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
};

// Contract addresses
export const CONTRACT_IDS = {
  settlement: 'CDZAJLQP5EMAMPVAZOF3AUF3S6PL7TSADHA6Y75NAL7XA72MLTNDAULR',
  orderbook: 'CA2KQFACY34RAIQTJAKBOGB3UPKPKDSLL2LFVZVQQZC4DPFDFDBW5FIP',
  registry: 'CAYHF7YE6JIQYWJPXCJO6KAJVFPFYHNERIU5IYUR3VGRZQTEI4D6SQRZ',
  verifier: 'CBSNZSSJ6EEJAEGMGVJHS3JCHQMQMA4COKJ7KE7U6MZGIKVNKOQJFNSJ',
};

// Client factory functions
import { Client as Settlement } from './settlement';
import { Client as Orderbook } from './orderbook';
import { Client as Registry } from './registry';
import { Client as Verifier } from './verifier';

export function createSettlementClient(publicKey?: string) {
  return new Settlement({
    contractId: CONTRACT_IDS.settlement,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    rpcUrl: NETWORK_CONFIG.rpcUrl,
    publicKey,
  });
}

export function createOrderbookClient(publicKey?: string) {
  return new Orderbook({
    contractId: CONTRACT_IDS.orderbook,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    rpcUrl: NETWORK_CONFIG.rpcUrl,
    publicKey,
  });
}

export function createRegistryClient(publicKey?: string) {
  return new Registry({
    contractId: CONTRACT_IDS.registry,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    rpcUrl: NETWORK_CONFIG.rpcUrl,
    publicKey,
  });
}

export function createVerifierClient(publicKey?: string) {
  return new Verifier({
    contractId: CONTRACT_IDS.verifier,
    networkPassphrase: NETWORK_CONFIG.networkPassphrase,
    rpcUrl: NETWORK_CONFIG.rpcUrl,
    publicKey,
  });
}
