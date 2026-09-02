export interface OrderedItem {
  name?: string;
  quantity?: number;
  variant_label?: string | null;
  line_label?: string;
}

export function itemLineLabel(item: OrderedItem): string {
  if (item.line_label) return item.line_label;
  const qty = item.quantity || 1;
  const name = (item.name || 'Item').trim();
  const variant = (item.variant_label || '').trim();
  return variant ? `${qty}× ${name} (${variant})` : `${qty}× ${name}`;
}
