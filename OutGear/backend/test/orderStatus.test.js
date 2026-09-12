import { describe, it, expect } from "vitest";
import {
  canTransitionStatus,
  ORDER_STATUS,
  CANCELLABLE_FROM,
} from "../src/services/orderService.js";

describe("canTransitionStatus", () => {
  it("allows forward flow one step at a time", () => {
    expect(canTransitionStatus(ORDER_STATUS.waitingPayment, ORDER_STATUS.processed)).toBe(true);
    expect(canTransitionStatus(ORDER_STATUS.processed, ORDER_STATUS.shipped)).toBe(true);
    expect(canTransitionStatus(ORDER_STATUS.shipped, ORDER_STATUS.completed)).toBe(true);
  });

  it("does not allow skipping stages", () => {
    expect(canTransitionStatus(ORDER_STATUS.waitingPayment, ORDER_STATUS.shipped)).toBe(false);
    expect(canTransitionStatus(ORDER_STATUS.processed, ORDER_STATUS.completed)).toBe(false);
  });

  it("allows cancellation only from waiting/proc", () => {
    expect(canTransitionStatus(ORDER_STATUS.waitingPayment, ORDER_STATUS.cancelled)).toBe(true);
    expect(canTransitionStatus(ORDER_STATUS.processed, ORDER_STATUS.cancelled)).toBe(true);
    expect(canTransitionStatus(ORDER_STATUS.shipped, ORDER_STATUS.cancelled)).toBe(false);
    expect(canTransitionStatus(ORDER_STATUS.completed, ORDER_STATUS.cancelled)).toBe(false);
  });

  it("does not allow transitions out of a completed order", () => {
    expect(canTransitionStatus(ORDER_STATUS.completed, ORDER_STATUS.cancelled)).toBe(false);
  });

  it("allows no-op transitions", () => {
    expect(canTransitionStatus(ORDER_STATUS.waitingPayment, ORDER_STATUS.waitingPayment)).toBe(true);
  });

  it("exposes the cancelled-from set constants", () => {
    expect(CANCELLABLE_FROM.has(ORDER_STATUS.waitingPayment)).toBe(true);
    expect(CANCELLABLE_FROM.has(ORDER_STATUS.processed)).toBe(true);
    expect(CANCELLABLE_FROM.has(ORDER_STATUS.shipped)).toBe(false);
  });
});