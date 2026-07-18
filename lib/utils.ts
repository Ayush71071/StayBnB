export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(d: Date | string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function parseJsonArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function avgRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return null;
  return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
}

export function nightsBetween(checkIn: Date, checkOut: Date) {
  return Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000);
}

export const SERVICE_FEE_RATE = 0.12;
export const CLEANING_FEE = 35;

// An unpaid "pending" booking holds its dates for this long before it stops
// blocking the calendar for other guests — otherwise an abandoned checkout
// would lock those dates forever.
export const PENDING_HOLD_MINUTES = 15;

export function pendingHoldCutoff() {
  return new Date(Date.now() - PENDING_HOLD_MINUTES * 60 * 1000);
}

// Bookings that currently occupy a listing's calendar: confirmed stays, plus
// pending ones still inside their payment hold window.
export function activeBookingFilter(): {
  OR: ({ status: string; createdAt?: { gte: Date } })[];
} {
  return {
    OR: [
      { status: "confirmed" },
      { status: "pending", createdAt: { gte: pendingHoldCutoff() } },
    ],
  };
}

export function priceBreakdown(pricePerNight: number, nights: number) {
  const subtotal = pricePerNight * nights;
  const serviceFee = Math.round(subtotal * SERVICE_FEE_RATE);
  return {
    subtotal,
    serviceFee,
    cleaningFee: CLEANING_FEE,
    total: subtotal + serviceFee + CLEANING_FEE,
  };
}
