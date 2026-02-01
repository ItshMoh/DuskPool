import { describe, it, expect, beforeEach } from "vitest";
import { DarkPoolMatchingEngine, PrivateOrder, generateMatchId } from "./index";
import { OrderSide } from "@rwa-darkpool/prover";

const MOCK_ASSET = "CASSETADDRESS000000000000000000000000000000000000000000";

function createMockOrder(overrides: Partial<PrivateOrder> = {}): PrivateOrder {
  return {
    commitment: "0x" + "1".repeat(64),
    trader: "GTRADER0000000000000000000000000000000000000000000000000",
    assetAddress: MOCK_ASSET,
    side: OrderSide.Buy,
    quantity: BigInt(100_000_000),
    price: BigInt(50_000_000),
    secret: BigInt("0x1234567890abcdef"),
    nonce: BigInt("0xfedcba0987654321"),
    timestamp: Date.now(),
    expiry: Date.now() + 3600000,
    whitelistIndex: 0,
    ...overrides,
  };
}

describe("DarkPoolMatchingEngine", () => {
  let engine: DarkPoolMatchingEngine;

  beforeEach(() => {
    engine = new DarkPoolMatchingEngine();
  });

  describe("order submission", () => {
    it("should accept buy orders", () => {
      const order = createMockOrder({ side: OrderSide.Buy });
      engine.submitOrder(order);

      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(1);
      expect(state.sells).toBe(0);
    });

    it("should accept sell orders", () => {
      const order = createMockOrder({ side: OrderSide.Sell });
      engine.submitOrder(order);

      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(0);
      expect(state.sells).toBe(1);
    });

    it("should track orders by asset", () => {
      const asset1 = "CASSET1111111111111111111111111111111111111111111111111";
      const asset2 = "CASSET2222222222222222222222222222222222222222222222222";

      engine.submitOrder(createMockOrder({ assetAddress: asset1, side: OrderSide.Buy }));
      engine.submitOrder(createMockOrder({ assetAddress: asset2, side: OrderSide.Buy }));

      expect(engine.getOrderBookState(asset1).buys).toBe(1);
      expect(engine.getOrderBookState(asset2).buys).toBe(1);
    });
  });

  describe("order matching", () => {
    it("should match buy and sell orders with same price", () => {
      const buyOrder = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(50_000_000),
        commitment: "0x" + "a".repeat(64),
      });
      const sellOrder = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "b".repeat(64),
      });

      engine.submitOrder(buyOrder);
      engine.submitOrder(sellOrder);

      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(0);
      expect(state.sells).toBe(0);
      expect(engine.getPendingMatchesCount()).toBe(1);
    });

    it("should match when buy price is higher than sell price", () => {
      const buyOrder = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(60_000_000),
        commitment: "0x" + "a".repeat(64),
      });
      const sellOrder = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "b".repeat(64),
      });

      engine.submitOrder(buyOrder);
      engine.submitOrder(sellOrder);

      expect(engine.getPendingMatchesCount()).toBe(1);
    });

    it("should not match when buy price is lower than sell price", () => {
      const buyOrder = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(40_000_000),
        commitment: "0x" + "a".repeat(64),
      });
      const sellOrder = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "b".repeat(64),
      });

      engine.submitOrder(buyOrder);
      engine.submitOrder(sellOrder);

      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(1);
      expect(state.sells).toBe(1);
      expect(engine.getPendingMatchesCount()).toBe(0);
    });

    it("should not match orders for different assets", () => {
      const asset1 = "CASSET1111111111111111111111111111111111111111111111111";
      const asset2 = "CASSET2222222222222222222222222222222222222222222222222";

      engine.submitOrder(createMockOrder({ assetAddress: asset1, side: OrderSide.Buy }));
      engine.submitOrder(createMockOrder({ assetAddress: asset2, side: OrderSide.Sell }));

      expect(engine.getOrderBookState(asset1).buys).toBe(1);
      expect(engine.getOrderBookState(asset2).sells).toBe(1);
      expect(engine.getPendingMatchesCount()).toBe(0);
    });
  });

  describe("price-time priority", () => {
    it("should match best buy price first", () => {
      const lowBuy = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(50_000_000),
        commitment: "0x" + "1".repeat(64),
        timestamp: Date.now() - 1000,
      });
      const highBuy = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(60_000_000),
        commitment: "0x" + "2".repeat(64),
        timestamp: Date.now(),
      });
      const sellOrder = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "3".repeat(64),
      });

      engine.submitOrder(lowBuy);
      engine.submitOrder(highBuy);
      engine.submitOrder(sellOrder);

      // High buy should match, low buy should remain
      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(1);
      expect(state.sells).toBe(0);
      expect(engine.getPendingMatchesCount()).toBe(1);
    });

    it("should match best sell price first", () => {
      const highSell = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(60_000_000),
        commitment: "0x" + "1".repeat(64),
        timestamp: Date.now() - 1000,
      });
      const lowSell = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "2".repeat(64),
        timestamp: Date.now(),
      });
      const buyOrder = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(55_000_000),
        commitment: "0x" + "3".repeat(64),
      });

      engine.submitOrder(highSell);
      engine.submitOrder(lowSell);
      engine.submitOrder(buyOrder);

      // Low sell should match with buy, high sell should remain
      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(0);
      expect(state.sells).toBe(1);
      expect(engine.getPendingMatchesCount()).toBe(1);
    });

    it("should use time priority when prices are equal", () => {
      const earlyBuy = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(50_000_000),
        commitment: "0x" + "1".repeat(64),
        timestamp: Date.now() - 2000,
      });
      const lateBuy = createMockOrder({
        side: OrderSide.Buy,
        price: BigInt(50_000_000),
        commitment: "0x" + "2".repeat(64),
        timestamp: Date.now(),
      });
      const sellOrder = createMockOrder({
        side: OrderSide.Sell,
        price: BigInt(50_000_000),
        commitment: "0x" + "3".repeat(64),
      });

      engine.submitOrder(lateBuy);
      engine.submitOrder(earlyBuy);
      engine.submitOrder(sellOrder);

      // Early buy should match first due to time priority
      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(1);
      expect(engine.getPendingMatchesCount()).toBe(1);
    });
  });

  describe("multiple matches", () => {
    it("should match multiple orders in sequence", () => {
      engine.submitOrder(createMockOrder({ side: OrderSide.Buy, commitment: "0x" + "1".repeat(64) }));
      engine.submitOrder(createMockOrder({ side: OrderSide.Buy, commitment: "0x" + "2".repeat(64) }));
      engine.submitOrder(createMockOrder({ side: OrderSide.Sell, commitment: "0x" + "3".repeat(64) }));
      engine.submitOrder(createMockOrder({ side: OrderSide.Sell, commitment: "0x" + "4".repeat(64) }));

      expect(engine.getPendingMatchesCount()).toBe(2);
      const state = engine.getOrderBookState(MOCK_ASSET);
      expect(state.buys).toBe(0);
      expect(state.sells).toBe(0);
    });
  });
});

describe("generateMatchId", () => {
  it("should generate 64 character hex string", () => {
    const id = generateMatchId();
    expect(id).toHaveLength(64);
    expect(/^[0-9a-f]+$/.test(id)).toBe(true);
  });

  it("should generate unique ids", () => {
    const ids = new Set<string>();
    for (let i = 0; i < 100; i++) {
      ids.add(generateMatchId());
    }
    expect(ids.size).toBe(100);
  });
});
