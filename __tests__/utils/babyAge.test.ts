import { calcAgeMonths, ageToLabel, ageMonthsToCourseId } from '../../src/utils/babyAge';

describe('calcAgeMonths', () => {
  beforeEach(() => {
    // Fix "now" to 2026-03 for deterministic tests
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-15'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 0 for current month', () => {
    expect(calcAgeMonths('2026-03')).toBe(0);
  });

  it('returns 0 for future date (never negative)', () => {
    expect(calcAgeMonths('2026-06')).toBe(0);
  });

  it('returns 3 for 3 months ago', () => {
    expect(calcAgeMonths('2025-12')).toBe(3);
  });

  it('returns 12 for exactly 1 year ago', () => {
    expect(calcAgeMonths('2025-03')).toBe(12);
  });

  it('returns 24 for exactly 2 years ago', () => {
    expect(calcAgeMonths('2024-03')).toBe(24);
  });

  it('returns 18 for 18 months ago', () => {
    expect(calcAgeMonths('2024-09')).toBe(18);
  });
});

describe('ageToLabel', () => {
  it('returns 0ヶ月 for 0 months', () => {
    expect(ageToLabel(0)).toBe('0ヶ月');
  });

  it('returns Nヶ月 for months under 12', () => {
    expect(ageToLabel(1)).toBe('1ヶ月');
    expect(ageToLabel(6)).toBe('6ヶ月');
    expect(ageToLabel(11)).toBe('11ヶ月');
  });

  it('returns N歳 for exact years', () => {
    expect(ageToLabel(12)).toBe('1歳');
    expect(ageToLabel(24)).toBe('2歳');
    expect(ageToLabel(36)).toBe('3歳');
  });

  it('returns N歳Mヶ月 for years with remaining months', () => {
    expect(ageToLabel(13)).toBe('1歳1ヶ月');
    expect(ageToLabel(18)).toBe('1歳6ヶ月');
    expect(ageToLabel(25)).toBe('2歳1ヶ月');
  });
});

describe('ageMonthsToCourseId', () => {
  it('returns 0-6M for months < 6', () => {
    expect(ageMonthsToCourseId(0)).toBe('0-6M');
    expect(ageMonthsToCourseId(3)).toBe('0-6M');
    expect(ageMonthsToCourseId(5)).toBe('0-6M');
  });

  it('returns 6-18M for months 6 to 17', () => {
    expect(ageMonthsToCourseId(6)).toBe('6-18M');
    expect(ageMonthsToCourseId(12)).toBe('6-18M');
    expect(ageMonthsToCourseId(17)).toBe('6-18M');
  });

  it('returns 18-36M for months >= 18', () => {
    expect(ageMonthsToCourseId(18)).toBe('18-36M');
    expect(ageMonthsToCourseId(24)).toBe('18-36M');
    expect(ageMonthsToCourseId(36)).toBe('18-36M');
  });
});
