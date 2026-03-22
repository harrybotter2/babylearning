import { useState, useCallback, useEffect } from 'react';
import { generateDotLayout, DotPosition } from '../utils/dotLayout';

interface UseDotGeneratorResult {
  dots: DotPosition[];
  regenerate: () => void;
}

/**
 * 指定した数のドットをランダム配置するカスタムフック。
 * count が変わると自動的に再生成する。
 */
export function useDotGenerator(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
): UseDotGeneratorResult {
  const [dots, setDots] = useState<DotPosition[]>(() =>
    count > 0 ? generateDotLayout(count, canvasWidth, canvasHeight) : [],
  );

  const regenerate = useCallback(() => {
    setDots(count > 0 ? generateDotLayout(count, canvasWidth, canvasHeight) : []);
  }, [count, canvasWidth, canvasHeight]);

  useEffect(() => {
    setDots(count > 0 ? generateDotLayout(count, canvasWidth, canvasHeight) : []);
  }, [count, canvasWidth, canvasHeight]);

  return { dots, regenerate };
}
