import { generateDotLayout, DotPosition } from '../../src/utils/dotLayout';

describe('generateDotLayout', () => {
  it('指定した数のドットを生成する', () => {
    const dots = generateDotLayout(5, 300, 300);
    expect(dots).toHaveLength(5);
  });

  it('各ドットはx・y・radius を持つ', () => {
    const dots = generateDotLayout(3, 300, 300);
    dots.forEach((dot: DotPosition) => {
      expect(typeof dot.x).toBe('number');
      expect(typeof dot.y).toBe('number');
      expect(typeof dot.radius).toBe('number');
    });
  });

  it('ドットはキャンバス内に収まる', () => {
    const width = 300;
    const height = 300;
    const dots = generateDotLayout(10, width, height);
    dots.forEach((dot: DotPosition) => {
      expect(dot.x - dot.radius).toBeGreaterThanOrEqual(0);
      expect(dot.x + dot.radius).toBeLessThanOrEqual(width);
      expect(dot.y - dot.radius).toBeGreaterThanOrEqual(0);
      expect(dot.y + dot.radius).toBeLessThanOrEqual(height);
    });
  });

  it('ドット同士が重ならない（最小距離を保つ）', () => {
    const dots = generateDotLayout(10, 300, 300);
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        const dx = dots[i].x - dots[j].x;
        const dy = dots[i].y - dots[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = (dots[i].radius + dots[j].radius) * 1.2;
        expect(distance).toBeGreaterThanOrEqual(minDistance);
      }
    }
  });

  it('同じ数でも呼び出すたびに異なる配置を生成する', () => {
    const dots1 = generateDotLayout(5, 300, 300);
    const dots2 = generateDotLayout(5, 300, 300);
    const same = dots1.every((d, i) => d.x === dots2[i].x && d.y === dots2[i].y);
    expect(same).toBe(false);
  });

  it('数が多い場合はドットサイズを自動縮小する', () => {
    const smallDots = generateDotLayout(5, 300, 300);
    const largeDots = generateDotLayout(50, 300, 300);
    expect(largeDots[0].radius).toBeLessThan(smallDots[0].radius);
  });

  it('1〜100の任意の数でクラッシュしない', () => {
    for (let n = 1; n <= 100; n++) {
      expect(() => generateDotLayout(n, 300, 500)).not.toThrow();
    }
  });
});
