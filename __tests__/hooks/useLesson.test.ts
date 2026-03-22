import { buildLessonCards, LessonCard } from '../../src/hooks/useLesson';

describe('buildLessonCards', () => {
  it('ベビーコース Day1 は 10 枚のドットカードを生成する', () => {
    const cards = buildLessonCards({ courseId: '0-6M', dayNumber: 1 });
    expect(cards).toHaveLength(10);
  });

  it('各カードは count と type を持つ', () => {
    const cards = buildLessonCards({ courseId: '0-6M', dayNumber: 1 });
    cards.forEach((card: LessonCard) => {
      expect(typeof card.count).toBe('number');
      expect(['dots', 'equation']).toContain(card.type);
    });
  });

  it('Day1 のカードの count は 1 以上 100 以下', () => {
    const cards = buildLessonCards({ courseId: '0-6M', dayNumber: 1 });
    cards.forEach((card: LessonCard) => {
      if (card.type === 'dots') {
        expect(card.count).toBeGreaterThanOrEqual(1);
        expect(card.count).toBeLessThanOrEqual(100);
      }
    });
  });

  it('Day51 以降は等式カードが含まれる', () => {
    const cards = buildLessonCards({ courseId: '6-18M', dayNumber: 51 });
    const hasEquation = cards.some((c: LessonCard) => c.type === 'equation');
    expect(hasEquation).toBe(true);
  });

  it('同じ数が連続して出ない', () => {
    const cards = buildLessonCards({ courseId: '0-6M', dayNumber: 10 });
    const dotCards = cards.filter((c: LessonCard) => c.type === 'dots');
    for (let i = 1; i < dotCards.length; i++) {
      expect(dotCards[i].count).not.toBe(dotCards[i - 1].count);
    }
  });

  it('コース別のフラッシュ速度が正しい', () => {
    const baby = buildLessonCards({ courseId: '0-6M', dayNumber: 1 });
    const toddler = buildLessonCards({ courseId: '18-36M', dayNumber: 1 });
    expect(baby[0].flashSpeedMs).toBe(1500);
    expect(toddler[0].flashSpeedMs).toBe(700);
  });
});
