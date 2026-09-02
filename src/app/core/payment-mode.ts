export interface PaymentModeFields {
  payment_method?: string;
  payment_mode?: string;
  payment_mode_label?: string;
  payment_verified?: boolean;
}

export function paymentModeLabel(order: PaymentModeFields): string {
  if (order.payment_mode_label) return order.payment_mode_label;
  if (order.payment_method === 'online') return 'Payment pending';
  return 'COD';
}

export function isVerifiedPaymentMode(order: PaymentModeFields): boolean {
  return !!order.payment_verified && (order.payment_mode === 'paid' || order.payment_mode === 'dp_qr');
}
