import { calcNextDay, buildMilestoneCheck, MilestoneType } from '../../src/hooks/useProgress';

describe('calcNextDay', () => {
  it('完了した翌日を返す', () => {
    expect(calcNextDay(1)).toBe(2);
  });

  it('178 日完了後は 178 のまま（完走）', () => {
    expect(calcNextDay(178)).toBe(178);
  });

  it('未完了の日はそのまま返す', () => {
    expect(calcNextDay(0)).toBe(1);
  });
});

describe('buildMilestoneCheck', () => {
  it('Day 1 完了でウェルカムマイルストーン', () => {
    const result = buildMilestoneCheck(1);
    expect(result).toContain('first_lesson' as MilestoneType);
  });

  it('Day 7 完了で 1 週間マイルストーン', () => {
    const result = buildMilestoneCheck(7);
    expect(result).toContain('week_1' as MilestoneType);
  });

  it('Day 30 完了で 1 ヶ月マイルストーン', () => {
    const result = buildMilestoneCheck(30);
    expect(result).toContain('month_1' as MilestoneType);
  });

  it('Day 178 完了で完走マイルストーン', () => {
    const result = buildMilestoneCheck(178);
    expect(result).toContain('complete' as MilestoneType);
  });

  it('マイルストーンがない日は空配列', () => {
    const result = buildMilestoneCheck(3);
    expect(result).toHaveLength(0);
  });
});
