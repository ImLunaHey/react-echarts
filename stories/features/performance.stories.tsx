import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Chart, type ChartHandle } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta = {
  title: 'Features/Performance',
  parameters: {
    docs: {
      description: {
        component:
          'ECharts handles huge datasets via three knobs: `large: true` (skip per-item shape lookup), `progressive` (chunked rendering), and `sampling` (downsample line data). For very large data, ship it as a typed-array `dataset` so ECharts can zero-copy it. Each story exposes a `count` slider in the Controls panel — drag it to scale the dataset up or down.',
      },
    },
  },
};

export default meta;

// ---------- helpers ----------

/**
 * Capture the time between a dataset becoming available and ECharts'
 * `finished` event firing. Returns a stable `onEvents` object so the
 * library doesn't rebind handlers each render (which can race with
 * progressive rendering on huge datasets).
 */
const useTimedRender = (key: unknown) => {
  const [ms, setMs] = useState<number | null>(null);
  const startRef = useRef<number | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    settledRef.current = false;
    setMs(null);
    startRef.current = performance.now();
  }, [key]);

  const onEvents = useMemo(
    () => ({
      finished: () => {
        if (settledRef.current || startRef.current === null) return;
        settledRef.current = true;
        setMs(performance.now() - startRef.current);
      },
    }),
    [],
  );

  return { ms, onEvents };
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ fontSize: 11, opacity: 0.6 }}>{label}</div>
    <div style={{ fontFamily: 'monospace', fontSize: 14 }}>{value}</div>
  </div>
);

const fmt = (n: number) => n.toLocaleString();

// Float32Array of [x, y, x, y, ...] randomly distributed in 0..100.
const genScatter = (n: number) => {
  const arr = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    arr[i * 2] = Math.random() * 100;
    arr[i * 2 + 1] = Math.random() * 100;
  }
  return arr;
};

// Float32Array clustered around (30,30) and (70,70).
const genClusters = (n: number) => {
  const arr = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const cx = Math.random() < 0.5 ? 30 : 70;
    const cy = Math.random() < 0.5 ? 30 : 70;
    arr[i * 2] = cx + (Math.random() - 0.5) * 30;
    arr[i * 2 + 1] = cy + (Math.random() - 0.5) * 30;
  }
  return arr;
};

const genWalk = (n: number) => {
  const arr: number[] = new Array(n);
  let v = 50;
  for (let i = 0; i < n; i++) {
    v += (Math.random() - 0.5) * 1.5;
    arr[i] = v;
  }
  return arr;
};

// ---------- Scatter (variable count) ----------

const ScatterDemo = ({ count }: { count: number }) => {
  const data = useMemo(() => genScatter(count), [count]);
  const t = useTimedRender(data);

  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
      dataset: { source: data, sourceHeader: false, dimensions: ['x', 'y'] },
      series: [
        {
          type: 'scatter',
          encode: { x: 0, y: 1 },
          large: true,
          largeThreshold: 2_000,
          progressive: Math.max(5_000, Math.floor(count / 20)),
          progressiveThreshold: 10_000,
          symbolSize: count > 500_000 ? 1.5 : 2,
          itemStyle: { color: '#5470c6', opacity: count > 200_000 ? 0.35 : 0.5 },
        },
      ],
    }),
    [data, count],
  );

  return (
    <div>
      <SizedBox>
        <Chart option={option} onEvents={t.onEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value={fmt(count)} />
        <Stat label="Buffer" value={`Float32Array (${((count * 8) / 1024 / 1024).toFixed(1)} MB)`} />
        <Stat label="Render" value={t.ms === null ? '…' : `${t.ms.toFixed(0)} ms`} />
      </div>
    </div>
  );
};

// ---------- Line (sampled, variable count) ----------

const LineDemo = ({ count }: { count: number }) => {
  const data = useMemo(() => {
    const arr: number[] = new Array(count);
    let v = 0;
    for (let i = 0; i < count; i++) {
      v += (Math.random() - 0.5) * 2;
      arr[i] = v;
    }
    return arr;
  }, [count]);

  const t = useTimedRender(data);

  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value' },
      dataZoom: [{ type: 'inside' }, { type: 'slider', height: 20, bottom: 8 }],
      series: [
        {
          type: 'line',
          data,
          showSymbol: false,
          sampling: 'lttb',
          large: true,
          progressive: Math.max(10_000, Math.floor(count / 10)),
          progressiveThreshold: 20_000,
          lineStyle: { width: 1 },
        },
      ],
    }),
    [data, count],
  );

  return (
    <div>
      <SizedBox width={720} height={360}>
        <Chart option={option} onEvents={t.onEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value={fmt(count)} />
        <Stat label="Sampling" value="LTTB" />
        <Stat label="Render" value={t.ms === null ? '…' : `${t.ms.toFixed(0)} ms`} />
      </div>
    </div>
  );
};

// ---------- 1M+ scatter (gated, variable count) ----------

const ScatterOnDemand = ({ count }: { count: number }) => {
  const [pending, setPending] = useState(count);
  const [active, setActive] = useState<number | null>(null);

  // Update the pending count when the slider changes; reset on regen.
  useEffect(() => setPending(count), [count]);

  const data = useMemo(() => (active === null ? null : genClusters(active)), [active]);
  const t = useTimedRender(data);

  const option = useMemo(() => {
    if (!data) return { animation: false };
    return {
      animation: false,
      tooltip: { show: false },
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: { type: 'value', min: 0, max: 100 },
      dataset: { source: data, sourceHeader: false, dimensions: ['x', 'y'] },
      series: [
        {
          type: 'scatter',
          encode: { x: 0, y: 1 },
          large: true,
          largeThreshold: 1_000,
          progressive: 50_000,
          progressiveThreshold: 100_000,
          symbolSize: 1.5,
          itemStyle: { color: '#5470c6', opacity: 0.35 },
        },
      ],
    };
  }, [data]);

  return (
    <div>
      <SizedBox width={720} height={400}>
        {active === null ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <button onClick={() => setActive(pending)} style={{ padding: '8px 16px' }}>
              Render {fmt(pending)} points
            </button>
          </div>
        ) : (
          <Chart option={option} onEvents={t.onEvents} />
        )}
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
        <Stat label="Points" value={active === null ? `${fmt(pending)} (pending)` : fmt(active)} />
        <Stat
          label="Buffer"
          value={`Float32Array (${(((active ?? pending) * 8) / 1024 / 1024).toFixed(1)} MB)`}
        />
        <Stat label="Render" value={t.ms === null ? (active !== null ? '…' : '—') : `${t.ms.toFixed(0)} ms`} />
        {active !== null && (
          <button
            onClick={() => {
              setActive(null);
              setTimeout(() => setActive(pending), 0);
            }}
            style={{ padding: '4px 10px' }}
          >
            Re-render @ {fmt(pending)}
          </button>
        )}
      </div>
    </div>
  );
};

// ---------- Streaming append (variable window) ----------

const StreamingAppend = ({ window: windowSize }: { window: number }) => {
  const ref = useRef<ChartHandle>(null);
  const bufRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [tick, setTick] = useState(0);

  // Truncate the buffer when the window shrinks.
  useEffect(() => {
    const buf = bufRef.current;
    while (buf.x.length > windowSize) {
      buf.x.shift();
      buf.y.shift();
    }
  }, [windowSize]);

  useEffect(() => {
    const id = setInterval(() => {
      const buf = bufRef.current;
      const next = buf.x.length === 0 ? 0 : buf.x[buf.x.length - 1]! + 1;
      buf.x.push(next);
      buf.y.push(Math.sin(next / 8) * 30 + (Math.random() - 0.5) * 6);
      while (buf.x.length > windowSize) {
        buf.x.shift();
        buf.y.shift();
      }
      setTick((n) => n + 1);
    }, 16);
    return () => clearInterval(id);
  }, [windowSize]);

  const option = useMemo(() => {
    const { x, y } = bufRef.current;
    return {
      animation: false,
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: x, show: false },
      yAxis: { type: 'value', min: -50, max: 50 },
      series: [
        {
          type: 'line',
          data: y,
          showSymbol: false,
          sampling: 'lttb',
          large: true,
          lineStyle: { width: 1 },
        },
      ],
    };
  }, [tick]);

  return (
    <div>
      <SizedBox width={720} height={300}>
        <Chart ref={ref} option={option} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Window" value={`${fmt(windowSize)} points`} />
        <Stat label="Frame rate" value="~60 fps (16 ms)" />
        <Stat label="Tick" value={fmt(tick)} />
        <Stat label="Buffered" value={fmt(bufRef.current.x.length)} />
      </div>
    </div>
  );
};

// ---------- Hover (variable count) ----------

const HoverDemo = ({ count }: { count: number }) => {
  const data = useMemo(() => genWalk(count), [count]);
  const [hover, setHover] = useState<{ index: number; value: number } | null>(null);

  const hoverEvents = useMemo(
    () => ({
      updateAxisPointer: (params: Record<string, unknown>) => {
        const axes = (params as { axesInfo?: Array<{ value: number }> }).axesInfo;
        const idx = axes?.[0]?.value;
        if (typeof idx === 'number' && data[idx] !== undefined) {
          setHover({ index: idx, value: data[idx] });
        }
      },
    }),
    [data],
  );

  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross', snap: true } },
      xAxis: { type: 'category', data: data.map((_, i) => i), axisLabel: { showMaxLabel: true } },
      yAxis: { type: 'value' },
      dataZoom: [{ type: 'inside' }, { type: 'slider', height: 18, bottom: 6 }],
      series: [
        {
          type: 'line',
          data,
          showSymbol: false,
          sampling: 'lttb',
          large: true,
          lineStyle: { width: 1 },
        },
      ],
    }),
    [data],
  );

  return (
    <div>
      <SizedBox width={720} height={360}>
        <Chart option={option} onEvents={hoverEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value={fmt(count)} />
        <Stat label="Hover index" value={hover ? fmt(hover.index) : '—'} />
        <Stat label="Hover value" value={hover ? hover.value.toFixed(3) : '—'} />
      </div>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        `axisPointer` snaps to the nearest sample on hover — no per-point hit testing required.
      </p>
    </div>
  );
};

// ---------- Click + nearest (gated, variable count) ----------

const ClickDemo = ({ count }: { count: number }) => {
  const [pending, setPending] = useState(count);
  const [active, setActive] = useState<number | null>(null);
  useEffect(() => setPending(count), [count]);

  const data = useMemo(() => (active === null ? null : genClusters(active)), [active]);

  const ref = useRef<ChartHandle>(null);
  const [click, setClick] = useState<{
    x: number;
    y: number;
    nearest: { x: number; y: number; i: number };
    searchMs: number;
  } | null>(null);
  const t = useTimedRender(data);

  const option = useMemo(() => {
    if (!data) return { animation: false };
    return {
      animation: false,
      tooltip: { show: false },
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: { type: 'value', min: 0, max: 100 },
      dataset: { source: data, sourceHeader: false, dimensions: ['x', 'y'] },
      series: [
        {
          type: 'scatter',
          encode: { x: 0, y: 1 },
          large: true,
          progressive: 50_000,
          symbolSize: 1.5,
          itemStyle: { color: '#5470c6', opacity: 0.35 },
        },
      ],
    };
  }, [data]);

  useEffect(() => {
    if (active === null || !data) return;
    const instance = ref.current?.getInstance();
    if (!instance) return;
    type ZrHandler = (p: { offsetX: number; offsetY: number }) => void;
    const ec = instance as unknown as {
      getZr: () => { on: (e: string, h: ZrHandler) => void; off: (e: string, h?: ZrHandler) => void };
      convertFromPixel: (finder: { gridIndex?: number }, p: [number, number]) => [number, number];
    };
    const zr = ec.getZr();
    const findNearest = (x: number, y: number) => {
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < data.length; i += 2) {
        const dx = data[i]! - x;
        const dy = data[i + 1]! - y;
        const d = dx * dx + dy * dy;
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      return { x: data[bestI]!, y: data[bestI + 1]!, i: bestI / 2 };
    };
    const handler: ZrHandler = (params) => {
      const point = ec.convertFromPixel({ gridIndex: 0 }, [params.offsetX, params.offsetY]);
      const t0 = performance.now();
      const nearest = findNearest(point[0], point[1]);
      const searchMs = performance.now() - t0;
      setClick({ x: point[0], y: point[1], nearest, searchMs });
    };
    zr.on('click', handler);
    return () => zr.off('click', handler);
  }, [active, data]);

  return (
    <div>
      <SizedBox width={720} height={400}>
        {active === null ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <button onClick={() => setActive(pending)} style={{ padding: '8px 16px' }}>
              Render {fmt(pending)} points (then click anywhere)
            </button>
          </div>
        ) : (
          <Chart ref={ref} option={option} onEvents={t.onEvents} />
        )}
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
        <Stat label="Points" value={active === null ? `${fmt(pending)} (pending)` : fmt(active)} />
        <Stat label="Render" value={t.ms === null ? (active !== null ? '…' : '—') : `${t.ms.toFixed(0)} ms`} />
        <Stat label="Clicked at" value={click ? `${click.x.toFixed(2)}, ${click.y.toFixed(2)}` : '—'} />
        <Stat
          label="Nearest point"
          value={click ? `[${fmt(click.nearest.i)}] ${click.nearest.x.toFixed(2)}, ${click.nearest.y.toFixed(2)}` : '—'}
        />
        <Stat label="Nearest search" value={click ? `${click.searchMs.toFixed(2)} ms` : '—'} />
      </div>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        `convertFromPixel` turns the click into chart coordinates; the nearest point is found in one pass over the buffer.
      </p>
    </div>
  );
};

// ---------- Brush select (variable count) ----------

const BrushDemo = ({ count }: { count: number }) => {
  const data = useMemo(() => genScatter(count), [count]);
  const [selection, setSelection] = useState<{ count: number; bounds?: [number, number, number, number] }>({ count: 0 });

  const brushEvents = useMemo(
    () => ({
      brushSelected: (params: Record<string, unknown>) => {
        const batch = (params as { batch?: Array<{ selected?: Array<{ dataIndex?: number[] }> }> }).batch;
        const selected = batch?.[0]?.selected?.[0]?.dataIndex ?? [];
        if (selected.length === 0) {
          setSelection({ count: 0 });
          return;
        }
        let xMin = Infinity;
        let xMax = -Infinity;
        let yMin = Infinity;
        let yMax = -Infinity;
        for (const i of selected) {
          const x = data[i * 2]!;
          const y = data[i * 2 + 1]!;
          if (x < xMin) xMin = x;
          if (x > xMax) xMax = x;
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
        setSelection({ count: selected.length, bounds: [xMin, yMin, xMax, yMax] });
      },
    }),
    [data],
  );

  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      toolbox: {
        feature: { brush: { type: ['rect', 'polygon', 'clear'] } },
        right: 12,
      },
      brush: { toolbox: ['rect', 'polygon', 'clear'], xAxisIndex: 0 },
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: { type: 'value', min: 0, max: 100 },
      dataset: { source: data, sourceHeader: false, dimensions: ['x', 'y'] },
      series: [
        {
          type: 'scatter',
          encode: { x: 0, y: 1 },
          large: true,
          progressive: 5_000,
          symbolSize: 2,
          itemStyle: { color: '#5470c6', opacity: 0.5 },
        },
      ],
    }),
    [data],
  );

  return (
    <div>
      <SizedBox width={720} height={400}>
        <Chart option={option} onEvents={brushEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
        <Stat label="Points" value={fmt(count)} />
        <Stat label="Selected" value={fmt(selection.count)} />
        <Stat
          label="Bounds"
          value={
            selection.bounds
              ? `x: ${selection.bounds[0].toFixed(1)}–${selection.bounds[2].toFixed(1)}, y: ${selection.bounds[1].toFixed(1)}–${selection.bounds[3].toFixed(1)}`
              : '—'
          }
        />
      </div>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        Use the toolbox at the top-right to draw a rectangle or polygon. `brushSelected` returns every point's data index in one event.
      </p>
    </div>
  );
};

// ---------- argTypes ----------

const countSlider = (min: number, max: number, step: number) => ({
  count: { control: { type: 'range' as const, min, max, step } },
});

// ---------- stories ----------

type CountStory = StoryObj<{ count: number }>;
type WindowStory = StoryObj<{ window: number }>;

export const ScatterAtScale: CountStory = {
  name: 'Scatter (variable count)',
  argTypes: countSlider(1_000, 500_000, 1_000),
  args: { count: 50_000 },
  render: ({ count }) => <ScatterDemo count={count} />,
};

export const LineAtScale: CountStory = {
  name: 'Line, sampled (variable count)',
  argTypes: countSlider(1_000, 500_000, 1_000),
  args: { count: 100_000 },
  render: ({ count }) => <LineDemo count={count} />,
};

export const ScatterOnDemandStory: CountStory = {
  name: 'Scatter on demand (1M default, up to 5M)',
  argTypes: countSlider(100_000, 5_000_000, 100_000),
  args: { count: 1_000_000 },
  render: ({ count }) => <ScatterOnDemand count={count} />,
};

export const StreamingStory: WindowStory = {
  name: 'Streaming append (variable window)',
  argTypes: { window: { control: { type: 'range', min: 100, max: 20_000, step: 100 } } },
  args: { window: 5_000 },
  render: ({ window }) => <StreamingAppend window={window} />,
};

export const HoverAtScale: CountStory = {
  name: 'Hover, axisPointer (variable count)',
  argTypes: countSlider(1_000, 500_000, 1_000),
  args: { count: 100_000 },
  render: ({ count }) => <HoverDemo count={count} />,
};

export const ClickAtScale: CountStory = {
  name: 'Click + nearest (1M default, up to 5M)',
  argTypes: countSlider(100_000, 5_000_000, 100_000),
  args: { count: 1_000_000 },
  render: ({ count }) => <ClickDemo count={count} />,
};

export const BrushAtScale: CountStory = {
  name: 'Brush select (variable count)',
  argTypes: countSlider(1_000, 500_000, 1_000),
  args: { count: 50_000 },
  render: ({ count }) => <BrushDemo count={count} />,
};
