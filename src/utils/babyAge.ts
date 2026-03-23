export function calcAgeMonths(birthYearMonth: string): number {
  const [year, month] = birthYearMonth.split('-').map(Number);
  const now = new Date();
  return Math.max(0, (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month));
}

export function ageToLabel(months: number): string {
  if (months < 1) return '0ヶ月';
  if (months < 12) return `${months}ヶ月`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}歳${m}ヶ月` : `${y}歳`;
}

export function ageMonthsToCourseId(months: number): '0-6M' | '6-18M' | '18-36M' {
  if (months < 6) return '0-6M';
  if (months < 18) return '6-18M';
  return '18-36M';
}
