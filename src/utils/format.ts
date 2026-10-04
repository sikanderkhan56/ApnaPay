export function formatPkr(amount: number): string {
  const [whole, fraction] = Math.abs(amount).toFixed(2).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const signed = amount < 0 ? '-' : '';
  return `${signed}Rs ${grouped}.${fraction}`;
}

export function formatSignedPkr(amount: number, direction: 'in' | 'out'): string {
  const prefix = direction === 'in' ? '+' : '-';
  return `${prefix}${formatPkr(Math.abs(amount))}`;
}

export function formatSignedAmount(amount: number, direction: 'in' | 'out'): string {
  return formatSignedPkr(amount, direction).replace('Rs ', '');
}

export function formatPhone(mobile: string): string {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length !== 11) {
    return mobile;
  }
  return `${digits.slice(0, 4)} ${digits.slice(4)}`;
}

export function formatCnic(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13);
  if (digits.length <= 5) {
    return digits;
  }
  if (digits.length <= 12) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = date.toLocaleTimeString('en-PK', {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (sameDay) {
    return `Today, ${time}`;
  }

  return date.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function createReference(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}${Date.now().toString().slice(-6)}${rand}`;
}

export function createId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
