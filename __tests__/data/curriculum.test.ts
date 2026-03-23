import { getCurriculumDay, CurriculumDay, TOTAL_DAYS, getPhase } from '../../src/data/curriculum';

describe('TOTAL_DAYS', () => {
  it('178 日である', () => {
    expect(TOTAL_DAYS).toBe(178);
  });
});

describe('getCurriculumDay', () => {
  it('Day 1 は量の認識フェーズ', () => {
    const day = getCurriculumDay(1);
    expect(day.phase).toBe('recognition');
  });

  it('Day 51 は等式導入フェーズ', () => {
    const day = getCurriculumDay(51);
    expect(day.phase).toBe('equation');
  });

  it('Day 101 は抽象化フェーズ', () => {
    const day = getCurriculumDay(101);
    expect(day.phase).toBe('abstraction');
  });

  it('Day 141 は深化フェーズ', () => {
    const day = getCurriculumDay(141);
    expect(day.phase).toBe('deepening');
  });

  it('各日は dotsPerSession と sessionsPerDay を持つ', () => {
    const day = getCurriculumDay(1);
    expect(typeof day.dotsPerSession).toBe('number');
    expect(typeof day.sessionsPerDay).toBe('number');
    expect(day.dotsPerSession).toBeGreaterThan(0);
    expect(day.sessionsPerDay).toBeGreaterThan(0);
  });

  it('1〜178 全ての日が定義されている', () => {
    for (let d = 1; d <= 178; d++) {
      expect(() => getCurriculumDay(d)).not.toThrow();
    }
  });

  it('範囲外の日はエラーを投げる', () => {
    expect(() => getCurriculumDay(0)).toThrow();
    expect(() => getCurriculumDay(179)).toThrow();
  });
});

describe('getPhase', () => {
  it.each([
    [1, 'recognition'],
    [50, 'recognition'],
    [51, 'equation'],
    [100, 'equation'],
    [101, 'abstraction'],
    [140, 'abstraction'],
    [141, 'deepening'],
    [178, 'deepening'],
  ])('Day %i は %s フェーズ', (day, phase) => {
    expect(getPhase(day)).toBe(phase);
  });
});
