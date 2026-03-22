export interface DotPosition {
  x: number;
  y: number;
  radius: number;
}

const BASE_RADIUS = 24;
const MIN_RADIUS = 6;
const MAX_ATTEMPTS = 200;

/**
 * 指定した数のドットをキャンバス内にランダム配置する。
 * ドット同士は重ならず（最小距離: radius * 2 * 1.2）、毎回異なる配置を生成する。
 * 数が多い場合はドットサイズを自動縮小する。
 */
export function generateDotLayout(count: number, canvasWidth: number, canvasHeight: number): DotPosition[] {
  const radius = calcRadius(count, canvasWidth, canvasHeight);
  const dots: DotPosition[] = [];

  let failCount = 0;

  while (dots.length < count && failCount < MAX_ATTEMPTS) {
    const x = radius + Math.random() * (canvasWidth - radius * 2);
    const y = radius + Math.random() * (canvasHeight - radius * 2);
    const candidate: DotPosition = { x, y, radius };

    if (isPositionValid(candidate, dots)) {
      dots.push(candidate);
      failCount = 0;
    } else {
      failCount++;
    }
  }

  // 配置できなかった場合はサイズを縮小して再試行
  if (dots.length < count) {
    const smallerRadius = Math.max(MIN_RADIUS, radius * 0.7);
    return generateWithRadius(count, canvasWidth, canvasHeight, smallerRadius);
  }

  return dots;
}

function calcRadius(count: number, canvasWidth: number, canvasHeight: number): number {
  const area = canvasWidth * canvasHeight;
  const dotArea = area / (count * 4);
  const r = Math.sqrt(dotArea / Math.PI);
  return Math.max(MIN_RADIUS, Math.min(BASE_RADIUS, r));
}

function generateWithRadius(count: number, canvasWidth: number, canvasHeight: number, radius: number): DotPosition[] {
  const dots: DotPosition[] = [];
  let failCount = 0;

  while (dots.length < count && failCount < MAX_ATTEMPTS * 2) {
    const x = radius + Math.random() * (canvasWidth - radius * 2);
    const y = radius + Math.random() * (canvasHeight - radius * 2);
    const candidate: DotPosition = { x, y, radius };

    if (isPositionValid(candidate, dots)) {
      dots.push(candidate);
      failCount = 0;
    } else {
      failCount++;
    }
  }

  return dots;
}

function isPositionValid(candidate: DotPosition, existing: DotPosition[]): boolean {
  return existing.every((dot) => {
    const dx = candidate.x - dot.x;
    const dy = candidate.y - dot.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const minDistance = (candidate.radius + dot.radius) * 1.2;
    return distance >= minDistance;
  });
}
