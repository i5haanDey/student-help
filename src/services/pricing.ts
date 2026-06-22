export const DEFAULT_HOURLY_RATE = 500
export const PLATFORM_FEE_RATE = 0.1
export const GRACE_PERIOD_MS = 15 * 60_000
export const EXTENSION_RESPONSE_TIMEOUT_MS = 3 * 60 * 1000
export const EXTENSION_FREE_MINUTES = 10
export const POLL_INTERVAL_MS = 3000

export function calculatePricing(rate: number, durationMinutes: number) {
  const amountInr = Math.round((rate / 60) * durationMinutes * 100) / 100
  const platformFeeInr = Math.round(amountInr * PLATFORM_FEE_RATE * 100) / 100
  const teacherPayoutInr = Math.round((amountInr - platformFeeInr) * 100) / 100
  return { amountInr, platformFeeInr, teacherPayoutInr }
}

export function calculateExtensionCost(hourlyRate: number, requestedMinutes: number) {
  const freeMinutes = Math.min(requestedMinutes, EXTENSION_FREE_MINUTES)
  const paidMinutes = Math.max(0, requestedMinutes - freeMinutes)
  const cost = Math.round((hourlyRate / 60) * paidMinutes * 100) / 100
  return { freeMinutes, paidMinutes, cost }
}

export function calculateProratedPayout(
  originalPayout: number,
  scheduledDurationMinutes: number,
  actualDurationMs: number
) {
  const scheduledMs = scheduledDurationMinutes * 60000
  const payRatio = Math.min(1, actualDurationMs / Math.max(scheduledMs, 1))
  const finalPayout = Math.round(originalPayout * payRatio * 100) / 100
  const refundAmount = Math.round((originalPayout - finalPayout) * 100) / 100
  return { finalPayout, refundAmount }
}
