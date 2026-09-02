export interface PaymentModeFields {
  payment_method?: string;
  payment_mode?: string;
  payment_mode_label?: string;
  payment_verified?: boolean;
  payment_via?: string | null;
}

/** Live board: checkout choice only — prepaid vs COD. */
export function liveCheckoutModeLabel(order: PaymentModeFields): string {
  const method = (order.payment_method || '').toLowerCase();
  const mode = (order.payment_mode || '').toLowerCase();
  if (mode === 'paid' || method === 'online') return 'Paid';
  return 'COD';
}

/**
 * Completed history: prepaid stays Paid.
 * Doorstep COD is shown as how money was actually taken.
 */
export function historyCollectionModeLabel(order: PaymentModeFields): string {
  const mode = (order.payment_mode || '').toLowerCase();
  const via = (order.payment_via || '').toLowerCase();
  const method = (order.payment_method || '').toLowerCase();

  if (mode === 'paid' || via === 'prepaid online') return 'Paid';
  if (mode === 'split' || via.includes('cash + qr')) return 'Split';
  if (mode === 'dp_qr' || via.includes('partner qr')) return 'Pay at delivery QR';
  if (mode === 'cod' || via.includes('cash') || method === 'cash' || method === 'cod') {
    return 'Cash collected';
  }
  if (method === 'online') return 'Paid';
  return 'Cash collected';
}

export function paymentModeLabel(order: PaymentModeFields): string {
  if (order.payment_mode_label) return order.payment_mode_label;
  if (order.payment_method === 'online') return 'Payment pending';
  return 'COD';
}

export function isVerifiedPaymentMode(order: PaymentModeFields): boolean {
  return !!order.payment_verified && (order.payment_mode === 'paid' || order.payment_mode === 'dp_qr');
}
