import { useMemo, type CSSProperties } from 'react';

import type { ChartProps, EChartsRenderer, EChartsTheme } from './types';

export type SparklineVariant = 'line' | 'area' | 'bars';

export type SparklineDatum = number | null | [number, number | null];

export interface SparklineSeries {
  /**
   * Either a flat array of values (auto-indexed on the x axis) or
   * `[x, y]` pairs (e.g. `[timestamp, value]`).
   */
  data: SparklineDatum[];
  /** Stroke color. Defaults to echarts' palette pick. */
  color?: string;
  /** Area fill color (only for `'area'` variant). Defaults to `color` at low opacity. */
  fill?: string;
  /** Defaults to `'area'`. */
  variant?: SparklineVariant;
  /** Optional series name. */
  name?: string;
}

export interface SparklineProps {
  /**
   * One or more series. For the common single-series case you can
   * pass `series={[{ data: [...] }]}`.
   */
  series: SparklineSeries[];
  /** Default `'value'`. Use `'time'` for ms timestamps. */
  xAxisType?: 'value' | 'time' | 'category';
  /** Default `'area'`. Per-series `variant` overrides this. */
  variant?: SparklineVariant;
  /** Default `'svg'`. */
  renderer?: EChartsRenderer;
  /** Optional theme to forward to the underlying chart. */
  theme?: EChartsTheme;
  height?: number | string;
  className?: string;
  style?: CSSProperties;
}

const buildSeries = (
  s: SparklineSeries,
  fallbackVariant: SparklineVariant
): Record<string, unknown> => {
  const variant = s.variant ?? fallbackVariant;
  const base: Record<string, unknown> = {
    name: s.name,
    data: s.data,
    silent: true,
    itemStyle: s.color ? { color: s.color } : undefined,
  };
  if (variant === 'bars') {
    return { ...base, type: 'bar' };
  }
  const lineConfig: Record<string, unknown> = {
    ...base,
    type: 'line',
    smooth: false,
    showSymbol: false,
    sampling: 'lttb',
    lineStyle: { color: s.color, width: 1 },
  };
  if (variant === 'area') {
    lineConfig.areaStyle = { color: s.fill ?? s.color, opacity: s.fill ? 1 : 0.2 };
  }
  return lineConfig;
};

const buildOption = (props: SparklineProps): Record<string, unknown> => {
  const { series, xAxisType = 'value', variant = 'area' } = props;
  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: false },
    tooltip: { show: false },
    xAxis: {
      type: xAxisType,
      show: false,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 'dataMin',
      max: 'dataMax',
    },
    series: series.map((s) => buildSeries(s, variant)),
  };
};

/**
 * Factory that returns a `<Sparkline>` component bound to the given
 * `<Chart>`. We can't import `<Chart>` directly because consumers
 * pick between `'@imlunahey/react-echarts'` (full bundle) and
 * `'@imlunahey/react-echarts/core'` (echarts/core), and each has its
 * own `<Chart>`. Each entrypoint exports its own `<Sparkline>` made
 * via this factory.
 */
export const createSparkline = (
  Chart: React.ComponentType<ChartProps & { ref?: React.Ref<unknown> }>
) => {
  const Sparkline = (props: SparklineProps) => {
    const { renderer = 'svg', theme, height = '100%', className, style } = props;
    const option = useMemo(() => buildOption(props), [props]);
    const containerStyle = useMemo<CSSProperties>(
      () => ({
        width: '100%',
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }),
      [height, style]
    );
    return (
      <div className={className} style={containerStyle}>
        <Chart
          option={option}
          renderer={renderer}
          theme={theme}
          style={{ width: '100%', height: '100%' }}
          replaceMerge="series"
        />
      </div>
    );
  };
  Sparkline.displayName = 'Sparkline';
  return Sparkline;
};
