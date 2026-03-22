import { getTodayJST, isSameDay, calcStreak } from '../../src/utils/dateUtils';

describe('getTodayJST', () => {
  it('YYYY-MM-DD 形式の文字列を返す', () => {
    const result = getTodayJST();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('isSameDay', () => {
  it('同じ日付は true を返す', () => {
    expect(isSameDay('2026-03-22', '2026-03-22')).toBe(true);
  });

  it('異なる日付は false を返す', () => {
    expect(isSameDay('2026-03-22', '2026-03-23')).toBe(false);
  });
});

describe('calcStreak', () => {
  it('連続した日付のストリーク数を正しく計算する', () => {
    const dates = ['2026-03-20', '2026-03-21', '2026-03-22'];
    expect(calcStreak(dates, '2026-03-22')).toBe(3);
  });

  it('途中で途切れた場合は直近の連続数を返す', () => {
    const dates = ['2026-03-18', '2026-03-21', '2026-03-22'];
    expect(calcStreak(dates, '2026-03-22')).toBe(2);
  });

  it('今日だけの場合は 1 を返す', () => {
    expect(calcStreak(['2026-03-22'], '2026-03-22')).toBe(1);
  });

  it('空配列の場合は 0 を返す', () => {
    expect(calcStreak([], '2026-03-22')).toBe(0);
  });

  it('今日が含まれない場合は 0 を返す', () => {
    const dates = ['2026-03-20', '2026-03-21'];
    expect(calcStreak(dates, '2026-03-22')).toBe(0);
  });
});
