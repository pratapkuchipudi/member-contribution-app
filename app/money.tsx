export type MoneyTone = 'expected' | 'paid' | 'pending';

export function formatMoney(v: any) {
  return '₹' + Number(v || 0).toLocaleString('en-IN');
}

const tones: Record<MoneyTone, string> = {
  expected: 'text-blue-600',
  paid: 'text-green-600',
  pending: 'text-red-600',
};

export function Money({ value, tone, className = '' }: { value: any; tone: MoneyTone; className?: string }) {
  return <span className={`font-medium ${tones[tone]} ${className}`}>{formatMoney(value)}</span>;
}
