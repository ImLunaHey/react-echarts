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
          'ECharts handles huge datasets via three knobs: `large: true` (skip per-item shape lookup), `progressive` (chunked rendering), and `sampling` (downsample line data). For very large data, ship it as a typed-array `dataset` so ECharts can zero-copy it.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

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

  // Reset start time when the dataset changes.
  useEffect(() => {
    settledRef.current = false;
    setMs(null);
    startRef.current = performance.now();
  }, [key]);

  // Stable handler — bound once and never rebinds.
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

// ---------- 50k scatter ----------

const Scatter50k = () => {
  const data = useMemo(() => {
    const N = 50_000;
    const arr = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      arr[i * 2] = Math.random() * 100;
      arr[i * 2 + 1] = Math.random() * 100;
    }
    return arr;
  }, []);

  const t = useTimedRender(data);

  // ECharts wants [[x,y], ...]; pass a typed-array dataset for cheap.
  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      xAxis: { type: 'value' },
      yAxis: { type: 'value' },
      dataset: {
        source: data,
        sourceHeader: false,
        dimensions: ['x', 'y'],
      },
      series: [
        {
          type: 'scatter',
          encode: { x: 0, y: 1 },
          large: true,
          largeThreshold: 2_000,
          progressive: 5_000,
          progressiveThreshold: 10_000,
          symbolSize: 2,
          itemStyle: { color: '#5470c6', opacity: 0.5 },
        },
      ],
    }),
    [data],
  );

  return (
    <div>
      <SizedBox>
        <Chart option={option} onEvents={t.onEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value="50,000" />
        <Stat label="Render" value={t.ms === null ? '…' : `${t.ms.toFixed(0)} ms`} />
      </div>
    </div>
  );
};

// ---------- 100k line (sampled) ----------

const Line100k = () => {
  const data = useMemo(() => {
    const N = 100_000;
    const arr: number[] = new Array(N);
    let v = 0;
    for (let i = 0; i < N; i++) {
      v += (Math.random() - 0.5) * 2;
      arr[i] = v;
    }
    return arr;
  }, []);

  const t = useTimedRender(data);

  const option = useMemo(
    () => ({
      animation: false,
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', show: false, data: data.map((_, i) => i) },
      yAxis: { type: 'value' },
      dataZoom: [
        { type: 'inside' },
        { type: 'slider', height: 20, bottom: 8 },
      ],
      series: [
        {
          type: 'line',
          data,
          showSymbol: false,
          sampling: 'lttb',
          large: true,
          progressive: 10_000,
          progressiveThreshold: 20_000,
          lineStyle: { width: 1 },
        },
      ],
    }),
    [data],
  );

  return (
    <div>
      <SizedBox width={720} height={360}>
        <Chart option={option} onEvents={t.onEvents} />
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value="100,000" />
        <Stat label="Sampling" value="LTTB" />
        <Stat label="Render" value={t.ms === null ? '…' : `${t.ms.toFixed(0)} ms`} />
      </div>
    </div>
  );
};

// ---------- 1M scatter (typed array, large mode) ----------

const Scatter1M = () => {
  const [ready, setReady] = useState(false);
  const data = useMemo(() => {
    if (!ready) return null;
    const N = 1_000_000;
    const arr = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      // Two clusters for a recognizable shape
      const cx = Math.random() < 0.5 ? 30 : 70;
      const cy = Math.random() < 0.5 ? 30 : 70;
      arr[i * 2] = cx + (Math.random() - 0.5) * 30;
      arr[i * 2 + 1] = cy + (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [ready]);

  const t = useTimedRender(data);

  const option = useMemo(() => {
    if (!data) return { animation: false };
    return {
      animation: false,
      tooltip: { show: false },
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: { type: 'value', min: 0, max: 100 },
      dataset: {
        source: data,
        sourceHeader: false,
        dimensions: ['x', 'y'],
      },
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
        {!ready ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <button onClick={() => setReady(true)} style={{ padding: '8px 16px' }}>
              Render 1,000,000 points
            </button>
          </div>
        ) : (
          <Chart option={option} onEvents={t.onEvents} />
        )}
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
        <Stat label="Points" value="1,000,000" />
        <Stat label="Buffer" value="Float32Array (8 MB)" />
        <Stat label="Render" value={t.ms === null ? (ready ? '…' : '—') : `${t.ms.toFixed(0)} ms`} />
      </div>
    </div>
  );
};

// ---------- Streaming append ----------

const StreamingAppend = () => {
  const ref = useRef<ChartHandle>(null);
  const bufRef = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      const buf = bufRef.current;
      const next = buf.x.length;
      buf.x.push(next);
      buf.y.push(Math.sin(next / 8) * 30 + (Math.random() - 0.5) * 6);
      if (buf.x.length > 5_000) {
        buf.x.shift();
        buf.y.shift();
      }
      setTick((n) => n + 1);
    }, 16);
    return () => clearInterval(id);
  }, []);

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
        <Stat label="Window" value="5,000 points" />
        <Stat label="Frame rate" value="~60 fps (16 ms)" />
        <Stat label="Tick" value={String(tick)} />
      </div>
    </div>
  );
};

// ---------- Hover at 100k (axisPointer) ----------

const HoverAt100k = () => {
  const data = useMemo(() => {
    const N = 100_000;
    const arr: number[] = new Array(N);
    let v = 50;
    for (let i = 0; i < N; i++) {
      v += (Math.random() - 0.5) * 1.5;
      arr[i] = v;
    }
    return arr;
  }, []);

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
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross', snap: true },
      },
      xAxis: {
        type: 'category',
        data: data.map((_, i) => i),
        axisLabel: { showMaxLabel: true },
      },
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
        <Stat label="Points" value="100,000" />
        <Stat label="Hover index" value={hover ? String(hover.index) : '—'} />
        <Stat label="Hover value" value={hover ? hover.value.toFixed(3) : '—'} />
      </div>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        `axisPointer` snaps to the nearest sample on hover — no per-point hit testing required.
      </p>
    </div>
  );
};

// ---------- Click at 1M (convertFromPixel) ----------

const ClickAt1M = () => {
  const [ready, setReady] = useState(false);
  const data = useMemo(() => {
    if (!ready) return null;
    const N = 1_000_000;
    const arr = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      const cx = Math.random() < 0.5 ? 30 : 70;
      const cy = Math.random() < 0.5 ? 30 : 70;
      arr[i * 2] = cx + (Math.random() - 0.5) * 30;
      arr[i * 2 + 1] = cy + (Math.random() - 0.5) * 30;
    }
    return arr;
  }, [ready]);

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

  const findNearest = (x: number, y: number) => {
    if (!data) return null;
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

  useEffect(() => {
    if (!ready || !data) return;
    const instance = ref.current?.getInstance();
    if (!instance) return;
    type ZrHandler = (p: { offsetX: number; offsetY: number }) => void;
    const ec = instance as unknown as {
      getZr: () => { on: (e: string, h: ZrHandler) => void; off: (e: string, h?: ZrHandler) => void };
      convertFromPixel: (finder: { gridIndex?: number }, p: [number, number]) => [number, number];
    };
    const zr = ec.getZr();
    const handler: ZrHandler = (params) => {
      const point = ec.convertFromPixel({ gridIndex: 0 }, [params.offsetX, params.offsetY]);
      const t0 = performance.now();
      const nearest = findNearest(point[0], point[1]);
      const searchMs = performance.now() - t0;
      if (nearest) setClick({ x: point[0], y: point[1], nearest, searchMs });
    };
    zr.on('click', handler);
    return () => zr.off('click', handler);
  }, [ready, data]);

  return (
    <div>
      <SizedBox width={720} height={400}>
        {!ready ? (
          <div style={{ display: 'grid', placeItems: 'center', height: '100%' }}>
            <button onClick={() => setReady(true)} style={{ padding: '8px 16px' }}>
              Render 1,000,000 points (then click anywhere)
            </button>
          </div>
        ) : (
          <Chart ref={ref} option={option} onEvents={t.onEvents} />
        )}
      </SizedBox>
      <div style={{ display: 'flex', gap: 24, marginTop: 8, flexWrap: 'wrap' }}>
        <Stat label="Points" value="1,000,000" />
        <Stat label="Render" value={t.ms === null ? (ready ? '…' : '—') : `${t.ms.toFixed(0)} ms`} />
        <Stat label="Clicked at" value={click ? `${click.x.toFixed(2)}, ${click.y.toFixed(2)}` : '—'} />
        <Stat
          label="Nearest point"
          value={click ? `[${click.nearest.i}] ${click.nearest.x.toFixed(2)}, ${click.nearest.y.toFixed(2)}` : '—'}
        />
        <Stat
          label="Nearest search"
          value={click ? `${click.searchMs.toFixed(2)} ms` : '—'}
        />
      </div>
      <p style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
        `convertFromPixel` turns the click into chart coordinates; the nearest point is found in one pass over the buffer.
      </p>
    </div>
  );
};

// ---------- Brush select at 50k ----------

const BrushAt50k = () => {
  const data = useMemo(() => {
    const N = 50_000;
    const arr = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      arr[i * 2] = Math.random() * 100;
      arr[i * 2 + 1] = Math.random() * 100;
    }
    return arr;
  }, []);

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
        feature: {
          brush: { type: ['rect', 'polygon', 'clear'] },
        },
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
        <Stat label="Points" value="50,000" />
        <Stat label="Selected" value={selection.count.toLocaleString()} />
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

export const Scatter50K: Story = { name: '50k scatter', render: () => <Scatter50k /> };
export const Line100K: Story = { name: '100k line (sampled)', render: () => <Line100k /> };
export const Scatter1MOnDemand: Story = { name: '1M scatter (on demand)', render: () => <Scatter1M /> };
export const Streaming: Story = { name: 'Streaming append (60 fps)', render: () => <StreamingAppend /> };
export const HoverAt100K: Story = { name: 'Hover at 100k (axisPointer)', render: () => <HoverAt100k /> };
export const ClickAt1MStory: Story = { name: 'Click at 1M (convertFromPixel)', render: () => <ClickAt1M /> };
export const BrushSelect50K: Story = { name: 'Brush select at 50k', render: () => <BrushAt50k /> };
