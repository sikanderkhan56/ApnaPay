const META_LABELS: Record<string, string> = {
  mobile: 'Mobile',
  bankId: 'Bank',
  account: 'Account',
  cnic: 'CNIC',
  billerId: 'Biller',
  consumerId: 'Consumer ID',
  billingMonth: 'Billing month',
  bundleId: 'Bundle',
  network: 'Network',
  last4: 'Card',
  expiry: 'Expiry',
  agentId: 'Agent',
  city: 'City',
  kind: 'Type',
};

export function labelForMeta(key: string): string {
  return META_LABELS[key] ?? key.replace(/_/g, ' ');
}
