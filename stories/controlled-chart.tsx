import type { ArgTypes } from '@storybook/react-vite';
import { useMemo } from 'react';

import { Chart, type ChartEventHandler, type ChartEventParams, type ChartProps } from '../src';
import { SizedBox } from './decorators';

/**
 * Inline dark theme used by the `theme` toggle.
 */
const DARK_THEME: Record<string, unknown> = {
  backgroundColor: '#1c1f24',
  textStyle: { color: '#e6e6e6' },
  color: ['#7eb6ff', '#ff8a80', '#ffd180', '#b9f6ca', '#ce93d8', '#80cbc4'],
  title: { textStyle: { color: '#ffffff' } },
  legend: { textStyle: { color: '#e6e6e6' } },
  axisLine: { lineStyle: { color: '#5b6270' } },
  splitLine: { lineStyle: { color: '#2c3038' } },
};

export type ControlledChartArgs = {
  /** ECharts option — exposed as a story arg so the docs panel shows it. */
  option: ChartProps['option'];
  /** Renderer toggle. */
  renderer: 'canvas' | 'svg';
  /** Show ECharts' built-in loading anim. */
  loading: boolean;
  /** Theme toggle. */
  theme: 'default' | 'dark';
  /** Container width in pixels (or '100%' for fluid). */
  width: number | string;
  /** Container height in pixels. */
  height: number;
  /** Bound to ECharts `click`. Logged in the Actions panel. */
  onClick?: (params: ChartEventParams) => void;
  /** Bound to `mouseover`. Logged in the Actions panel. */
  onMouseover?: (params: ChartEventParams) => void;
  /** Bound to `legendselectchanged`. Logged in the Actions panel. */
  onLegendselectchanged?: (params: ChartEventParams) => void;
  /** Bound to `datazoom`. Logged in the Actions panel. */
  onDatazoom?: (params: ChartEventParams) => void;
};

/**
 * Default arg values for {@link ControlledChart}. Spread into a story's
 * `args` and override `option` per story.
 */
export const controlledChartDefaults: Omit<ControlledChartArgs, 'option'> = {
  renderer: 'canvas',
  loading: false,
  theme: 'default',
  width: 640,
  height: 360,
};

/**
 * Storybook `argTypes` for the controls panel. Spread this into a
 * story's `argTypes`.
 */
export const controlledChartArgTypes: Partial<ArgTypes<ControlledChartArgs>> = {
  option: { control: 'object' },
  renderer: {
    control: { type: 'inline-radio' },
    options: ['canvas', 'svg'],
  },
  loading: { control: 'boolean' },
  theme: {
    control: { type: 'inline-radio' },
    options: ['default', 'dark'],
  },
  width: { control: { type: 'number', min: 200, max: 1200, step: 20 } },
  height: { control: { type: 'number', min: 160, max: 800, step: 20 } },
  onClick: { action: 'click' },
  onMouseover: { action: 'mouseover' },
  onLegendselectchanged: { action: 'legendselectchanged' },
  onDatazoom: { action: 'datazoom' },
};

/**
 * Renders a `<Chart>` wired up to a story's args. Toggling the controls
 * panel changes the rendered chart immediately; events fire into the
 * Storybook Actions panel.
 */
export const ControlledChart = (args: ControlledChartArgs) => {
  const onEvents = useMemo(() => {
    const map: Record<string, ChartEventHandler> = {};
    if (args.onClick) map.click = args.onClick;
    if (args.onMouseover) map.mouseover = args.onMouseover;
    if (args.onLegendselectchanged) map.legendselectchanged = args.onLegendselectchanged;
    if (args.onDatazoom) map.datazoom = args.onDatazoom;
    return map;
  }, [args.onClick, args.onMouseover, args.onLegendselectchanged, args.onDatazoom]);

  const theme = args.theme === 'dark' ? DARK_THEME : undefined;

  return (
    <SizedBox width={args.width} height={args.height}>
      <Chart
        option={args.option}
        renderer={args.renderer}
        loading={args.loading}
        theme={theme}
        onEvents={onEvents}
      />
    </SizedBox>
  );
};
