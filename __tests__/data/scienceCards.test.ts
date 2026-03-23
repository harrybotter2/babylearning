import { SCIENCE_CARDS, getScienceCardForDay, ScienceCard } from '../../src/data/scienceCards';

describe('SCIENCE_CARDS', () => {
  it('30 枚以上存在する', () => {
    expect(SCIENCE_CARDS.length).toBeGreaterThanOrEqual(30);
  });

  it('各カードは day・title・body を持つ', () => {
    SCIENCE_CARDS.forEach((card: ScienceCard) => {
      expect(typeof card.day).toBe('number');
      expect(typeof card.title).toBe('string');
      expect(typeof card.body).toBe('string');
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.body.length).toBeGreaterThan(0);
    });
  });

  it('day は 1〜178 の範囲内', () => {
    SCIENCE_CARDS.forEach((card: ScienceCard) => {
      expect(card.day).toBeGreaterThanOrEqual(1);
      expect(card.day).toBeLessThanOrEqual(178);
    });
  });

  it('day の重複がない', () => {
    const days = SCIENCE_CARDS.map((c) => c.day);
    const unique = new Set(days);
    expect(unique.size).toBe(days.length);
  });
});

describe('getScienceCardForDay', () => {
  it('対象の日のカードを返す', () => {
    const card = getScienceCardForDay(1);
    expect(card).not.toBeNull();
    expect(card!.day).toBe(1);
  });

  it('カードがない日は null を返す', () => {
    // Day 2 にはカードがない想定
    const card = getScienceCardForDay(2);
    expect(card).toBeNull();
  });

  it('Day 1 はサイエンスカードを持つ', () => {
    expect(getScienceCardForDay(1)).not.toBeNull();
  });
});
