export const name = 'baseline';
export const minDataPoints = 3;

function linreg(points) {
  const n = points.length;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const { t, v } of points) { sx += t; sy += v; sxy += t * v; sxx += t * t; }
  const denom = n * sxx - sx * sx;
  const slope = denom === 0 ? 0 : (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;

  const meanY = sy / n;
  let ssTot = 0, ssRes = 0;
  for (const { t, v } of points) {
    ssTot += (v - meanY) ** 2;
    ssRes += (v - (intercept + slope * t)) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : 1 - ssRes / ssTot;
  return { slope, intercept, r2, meanY };
}

export function predict(points, horizon = 6) {
  if (!points || points.length < minDataPoints) {
    return { status: 'insufficient', points: points?.length ?? 0 };
  }
  const { slope, intercept, r2, meanY } = linreg(points);
  const lastT = points[points.length - 1].t;
  const projection = Math.max(0, intercept + slope * (lastT + horizon));

  const velocityPct = meanY > 0 ? +((slope / meanY) * 100).toFixed(1) : 0;
  const confidence = +Math.max(0, Math.min(1, r2 * Math.min(1, points.length / 8))).toFixed(2);

  return {
    status: 'ok',
    slope: +slope.toFixed(3),
    velocityPct,
    projection: +projection.toFixed(1),
    confidence,
    r2: +r2.toFixed(2),
  };
}
