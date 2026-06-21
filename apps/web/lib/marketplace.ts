export const REPORTS_BUCKET = 'reports';
export const MAX_REPORT_FILE_SIZE = 10 * 1024 * 1024;

export type MarketplaceReport = {
  id: string;
  locationIdentifier: string;
  price: number;
  createdAt: string;
  category: string;
};

export function toPriceNumber(value: number | string | null): number {
  const price = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Invalid report price.');
  }

  return price;
}

export function toStripeAmountCents(value: number | string | null): number {
  const cents = Math.round(toPriceNumber(value) * 100);

  if (!Number.isInteger(cents) || cents < 50) {
    throw new Error('Report price must be at least $0.50.');
  }

  return cents;
}
