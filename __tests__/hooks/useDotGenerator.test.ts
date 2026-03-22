import { renderHook, act } from '@testing-library/react-native';
import { useDotGenerator } from '../../src/hooks/useDotGenerator';

describe('useDotGenerator', () => {
  it('count に応じたドット配置を返す', () => {
    const { result } = renderHook(() => useDotGenerator(5, 300, 500));
    expect(result.current.dots).toHaveLength(5);
  });

  it('regenerate を呼ぶと新しい配置を生成する', () => {
    const { result } = renderHook(() => useDotGenerator(5, 300, 500));
    const firstDots = result.current.dots;
    act(() => {
      result.current.regenerate();
    });
    const secondDots = result.current.dots;
    const same = firstDots.every((d, i) => d.x === secondDots[i].x && d.y === secondDots[i].y);
    expect(same).toBe(false);
  });

  it('count が 0 の場合は空配列を返す', () => {
    const { result } = renderHook(() => useDotGenerator(0, 300, 500));
    expect(result.current.dots).toHaveLength(0);
  });

  it('count が変わると自動的に再生成する', () => {
    const { result, rerender } = renderHook(
      ({ count }: { count: number }) => useDotGenerator(count, 300, 500),
      { initialProps: { count: 5 } },
    );
    expect(result.current.dots).toHaveLength(5);
    rerender({ count: 10 });
    expect(result.current.dots).toHaveLength(10);
  });
});
