export const name = 'lstm';
export const minDataPoints = 48;
const LOOKBACK = 6;
const EPOCHS = 40;

export async function predict(points, horizon = 6) {
  if (!points || points.length < minDataPoints) {
    return { status: 'standby', points: points?.length ?? 0, need: minDataPoints };
  }
  const tf = await import('@tensorflow/tfjs');
  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const norm = vals.map((v) => (v - min) / range);

  const X = [], Y = [];
  for (let i = 0; i + LOOKBACK < norm.length; i++) {
    X.push(norm.slice(i, i + LOOKBACK).map((v) => [v]));
    Y.push(norm[i + LOOKBACK]);
  }
  const xs = tf.tensor3d(X);
  const ys = tf.tensor2d(Y, [Y.length, 1]);

  const model = tf.sequential();
  model.add(tf.layers.lstm({ units: 8, inputShape: [LOOKBACK, 1] }));
  model.add(tf.layers.dense({ units: 1 }));
  model.compile({ optimizer: tf.train.adam(0.05), loss: 'meanSquaredError' });

  const hist = await model.fit(xs, ys, { epochs: EPOCHS, verbose: 0 });
  const finalLoss = hist.history.loss.at(-1) ?? 1;

  let seq = norm.slice(-LOOKBACK);
  let next = seq.at(-1);
  for (let h = 0; h < horizon; h++) {
    const inp = tf.tensor3d([seq.map((v) => [v])]);
    const out = model.predict(inp);
    next = (await out.data())[0];
    inp.dispose(); out.dispose();
    seq = [...seq.slice(1), next];
  }
  xs.dispose(); ys.dispose(); model.dispose();

  const projection = Math.max(0, next * range + min);
  const lastActual = vals.at(-1) || 1;
  const velocityPct = +(((projection - lastActual) / (lastActual || 1)) / horizon * 100).toFixed(1);
  const confidence = +Math.max(0, Math.min(1, (1 - finalLoss) * Math.min(1, points.length / 72))).toFixed(2);

  return { status: 'ok', projection: +projection.toFixed(1), velocityPct, confidence, loss: +finalLoss.toFixed(4) };
}
