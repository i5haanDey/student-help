import { describe, it, expect } from "vitest"
import { calculatePricing, calculateExtensionCost, calculateProratedPayout } from "../pricing"

describe("calculatePricing", () => {
  it("computes full pricing for a 60-minute session at ₹500/hr", () => {
    const result = calculatePricing(500, 60)
    expect(result.amountInr).toBe(500)
    expect(result.platformFeeInr).toBe(50)
    expect(result.teacherPayoutInr).toBe(450)
  })

  it("computes pricing for 30 minutes", () => {
    const result = calculatePricing(500, 30)
    expect(result.amountInr).toBe(250)
    expect(result.platformFeeInr).toBe(25)
    expect(result.teacherPayoutInr).toBe(225)
  })

  it("rounds to 2 decimal places", () => {
    const result = calculatePricing(450, 45)
    expect(result.amountInr).toBe(337.5)
    expect(result.platformFeeInr).toBe(33.75)
    expect(result.teacherPayoutInr).toBe(303.75)
  })

  it("handles zero duration", () => {
    const result = calculatePricing(500, 0)
    expect(result.amountInr).toBe(0)
    expect(result.platformFeeInr).toBe(0)
    expect(result.teacherPayoutInr).toBe(0)
  })
})

describe("calculateExtensionCost", () => {
  it("first 10 minutes are free", () => {
    const result = calculateExtensionCost(500, 10)
    expect(result.freeMinutes).toBe(10)
    expect(result.paidMinutes).toBe(0)
    expect(result.cost).toBe(0)
  })

  it("charges for minutes beyond 10", () => {
    const result = calculateExtensionCost(600, 15)
    expect(result.freeMinutes).toBe(10)
    expect(result.paidMinutes).toBe(5)
    expect(result.cost).toBe(50)
  })

  it("handles extension less than 10 minutes", () => {
    const result = calculateExtensionCost(500, 5)
    expect(result.freeMinutes).toBe(5)
    expect(result.paidMinutes).toBe(0)
    expect(result.cost).toBe(0)
  })
})

describe("calculateProratedPayout", () => {
  it("full payout when actual equals scheduled duration", () => {
    const result = calculateProratedPayout(450, 60, 3600000)
    expect(result.finalPayout).toBe(450)
    expect(result.refundAmount).toBe(0)
  })

  it("half payout for half the duration", () => {
    const result = calculateProratedPayout(450, 60, 1800000)
    expect(result.finalPayout).toBe(225)
    expect(result.refundAmount).toBe(225)
  })

  it("caps payout at 100% even if actual exceeds scheduled", () => {
    const result = calculateProratedPayout(450, 60, 7200000)
    expect(result.finalPayout).toBe(450)
    expect(result.refundAmount).toBe(0)
  })

  it("zero payout for no actual duration", () => {
    const result = calculateProratedPayout(450, 60, 0)
    expect(result.finalPayout).toBe(0)
    expect(result.refundAmount).toBe(450)
  })
})
