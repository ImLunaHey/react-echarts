import * as echartsCore from 'echarts/core';

import {
  createChart,
  createConnect,
  createDisconnect,
  createUseChart,
} from './factory';
import type { EChartsLike } from './types';

const echartsApi = echartsCore as unknown as EChartsLike;

/**
 * `<Chart>` bound to `echarts/core`. Pull in only the chart and
 * component types you actually use, then `echarts.use([...])` to
 * register them. The bundle stays small.
 *
 * @example
 * import { Chart } from '@imlunahey/react-echarts/core';
 * import * as echarts from 'echarts/core';
 * import { LineChart } from 'echarts/charts';
 * import { GridComponent, TooltipComponent } from 'echarts/components';
 * import { CanvasRenderer } from 'echarts/renderers';
 *
 * echarts.use([LineChart, GridComponent, TooltipComponent, CanvasRenderer]);
 *
 * <Chart option={...} />
 */
export const Chart = createChart(echartsApi);

/** Hook variant of {@link Chart}, bound to `echarts/core`. */
export const useChart = createUseChart(echartsApi);

/** {@link echarts.connect} bound to `echarts/core`. */
export const connect = createConnect(echartsApi);

/** {@link echarts.disconnect} bound to `echarts/core`. */
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
