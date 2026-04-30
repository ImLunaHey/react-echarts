import * as echarts from 'echarts';

import {
  createChart,
  createConnect,
  createDisconnect,
  createUseChart,
} from './factory';
import type { EChartsLike } from './types';

const echartsApi = echarts as unknown as EChartsLike;

/**
 * The main `<Chart>` component, bound to the full `echarts` build.
 *
 * @example
 * import { Chart } from '@imlunahey/react-echarts';
 *
 * <Chart
 *   option={{ xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed'] },
 *             yAxis: { type: 'value' },
 *             series: [{ type: 'line', data: [1, 2, 3] }] }}
 *   style={{ height: 320 }}
 * />
 */
export const Chart = createChart(echartsApi);

/**
 * Imperative hook bound to the full `echarts` build. Use when you
 * already own the container `ref` (e.g. inside a layout component).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const chart = useChart(ref, { option });
 * useEffect(() => { chart.dispatchAction({ type: 'highlight' }); }, []);
 */
export const useChart = createUseChart(echartsApi);

/**
 * Link charts with the same {@link ChartProps.group} so tooltips,
 * dataZoom, and brush selection stay in sync. Call once after both
 * charts have mounted.
 */
export const connect = createConnect(echartsApi);

/**
 * Reverse of {@link connect} — break the link for a group.
 */
export const disconnect = createDisconnect(echartsApi);

export { ReactEChartsError, NotInitialized } from './errors';
export type {
  ChartEventHandler,
  ChartEventParams,
  ChartEvents,
  ChartHandle,
  ChartLoading,
  ChartProps,
  EChartsInstance,
  EChartsLike,
  EChartsLocale,
  EChartsRenderer,
  EChartsTheme,
} from './types';
export {
  createChart,
  createConnect,
  createDisconnect,
  createUseChart,
} from './factory';
