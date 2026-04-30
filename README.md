# @imlunahey/react-echarts

A thin, opinionated React wrapper for [Apache ECharts](https://echarts.apache.org). One `<Chart>` component, auto-resize, typed events, imperative ref handle, optional tree-shaken core build.

```tsx
import { Chart } from '@imlunahey/react-echarts';

<Chart
  option={{
    xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
    yAxis: { type: 'value' },
    series: [{ type: 'line', data: [120, 132, 101, 134, 90] }],
  }}
  style={{ height: 320 }}
/>
```

## Installation

```sh
pnpm add @imlunahey/react-echarts echarts
# peer deps: react >=19, react-dom >=19
```

Requires Node 20+ for the build toolchain. Ships ESM and CJS.

## Quick start

```tsx
import { Chart } from '@imlunahey/react-echarts';
import type { EChartsOption } from 'echarts';

const option: EChartsOption = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: [120, 132, 101, 134, 90] }],
};

export const Sparkline = () => (
  <Chart option={option} style={{ height: 240 }} />
);
```

The container defaults to `width: 100%; height: 100%` — give it a parent with size, or pass an explicit `style`.

## One component, every chart type

`<Chart>` is a single component. The chart kind is just a series property:

```tsx
<Chart option={{ ..., series: [{ type: 'line',          data }] }} />
<Chart option={{ ..., series: [{ type: 'bar',           data }] }} />
<Chart option={{ ..., series: [{ type: 'pie',           data }] }} />
<Chart option={{ ..., series: [{ type: 'scatter',       data }] }} />
<Chart option={{ ..., series: [{ type: 'effectScatter', data }] }} />
<Chart option={{ ..., series: [{ type: 'boxplot',       data }] }} />
<Chart option={{ ..., series: [{ type: 'candlestick',   data }] }} />
<Chart option={{ ..., series: [{ type: 'heatmap',       data }] }} />
<Chart option={{ ..., series: [{ type: 'radar',         data }] }} />
<Chart option={{ ..., series: [{ type: 'gauge',         data }] }} />
<Chart option={{ ..., series: [{ type: 'funnel',        data }] }} />
<Chart option={{ ..., series: [{ type: 'sankey',        data }] }} />
<Chart option={{ ..., series: [{ type: 'graph',         data }] }} />
<Chart option={{ ..., series: [{ type: 'tree',          data }] }} />
<Chart option={{ ..., series: [{ type: 'treemap',       data }] }} />
<Chart option={{ ..., series: [{ type: 'sunburst',      data }] }} />
<Chart option={{ ..., series: [{ type: 'parallel',      data }] }} />
<Chart option={{ ..., series: [{ type: 'lines',         data }] }} />
<Chart option={{ ..., series: [{ type: 'themeRiver',    data }] }} />
<Chart option={{ ..., series: [{ type: 'pictorialBar',  data }] }} />
<Chart option={{ ..., series: [{ type: 'map',           data, map: 'name' }] }} />
<Chart option={{ ..., series: [{ type: 'custom',        renderItem }] }} />
```

For `map`, register either a geoJSON or an SVG once via `echarts.registerMap('name', payload)` before referencing it in `series[].map`. Use geoJSON for geographic maps; use `{svg: '<svg>...</svg>'}` to turn any diagram (floor plans, anatomy, factory layouts, sports fields) into an interactive choropleth. The Storybook ships both a real world choropleth and the classic ECharts beef-cuts SVG demo — see the **Chart types / Map** sidebar.

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `option` | `EChartsOption` | required | Re-renders on reference change. |
| `theme` | `string \| object` | — | String name (registered) or inline object. Reinits on change. |
| `renderer` | `'canvas' \| 'svg'` | `'canvas'` | Reinits on change. |
| `devicePixelRatio` | `number` | `window.devicePixelRatio` | Canvas only. Reinits on change. |
| `locale` | `string` | — | Reinits on change. |
| `notMerge` | `boolean` | `false` | Replace previous option entirely. |
| `lazyUpdate` | `boolean` | `false` | Defer redraw to next frame. |
| `silent` | `boolean` | `false` | Suppress events on update. |
| `group` | `string` | — | For `connect()`. |
| `loading` | `boolean \| { type, opts }` | `false` | Native loading anim. |
| `onEvents` | `Record<string, fn>` | — | Map of ECharts event → handler. |
| `onInit` | `(instance) => void` | — | Called once per init. |
| `className` | `string` | — | On the container `<div>`. |
| `style` | `CSSProperties` | `{ width: '100%', height: '100%' }` | On the container `<div>`. |

The `ref` exposes a typed `ChartHandle`: `getInstance`, `dispatchAction`, `resize`, `clear`, `showLoading`, `hideLoading`.

## Events

```tsx
<Chart
  option={option}
  onEvents={{
    click: (params) => console.log(params),
    legendselectchanged: (params) => console.log('legend', params),
    datazoom: (params) => console.log('zoom', params),
  }}
/>
```

Handlers re-bind only when their identity changes. Wrap inline handlers in `useCallback` if you want to avoid the rebind cost.

## Imperative access

```tsx
import { Chart, type ChartHandle } from '@imlunahey/react-echarts';

const ref = useRef<ChartHandle>(null);

useEffect(() => {
  ref.current?.dispatchAction({
    type: 'highlight',
    seriesIndex: 0,
    dataIndex: 3,
  });
}, []);

<Chart ref={ref} option={option} />
```

There's also a `useChart` hook for when you own the container yourself:

```tsx
import { useChart } from '@imlunahey/react-echarts';

const ref = useRef<HTMLDivElement>(null);
const chart = useChart(ref, { option, theme });
chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 0 });

<div ref={ref} style={{ height: 240 }} />
```

## Connecting charts (synced tooltips)

```tsx
import { Chart, connect } from '@imlunahey/react-echarts';

useEffect(() => connect('dashboard'), []);

<Chart group="dashboard" option={a} />
<Chart group="dashboard" option={b} />
```

Tooltips, dataZoom, and brush selection now stay in sync across all charts in the group.

## Performance — large datasets

ECharts renders 50k–1M points smoothly when you turn on the right knobs. The wrapper doesn't change anything here; the work is on the `option`:

```tsx
<Chart
  option={{
    animation: false,
    series: [{
      type: 'scatter',
      data: hugeArray,
      large: true,              // skip per-point hit-testing
      largeThreshold: 2_000,    // when 'large' kicks in
      progressive: 5_000,       // chunked rendering: points per frame
      progressiveThreshold: 10_000,
      symbolSize: 2,
    }],
  }}
/>
```

For million-point scatter, ship the data as a `Float32Array` `dataset` so ECharts never copies it:

```tsx
const buf = new Float32Array(N * 2); // [x, y, x, y, ...]
// ... fill ...

<Chart option={{
  animation: false,
  dataset: { source: buf, sourceHeader: false, dimensions: ['x', 'y'] },
  xAxis: { type: 'value' }, yAxis: { type: 'value' },
  series: [{ type: 'scatter', encode: { x: 0, y: 1 }, large: true, progressive: 50_000 }],
}} />
```

For long line charts, add `sampling: 'lttb'` (or `'min'`/`'max'`/`'average'`) and `showSymbol: false`. For streaming, keep a rolling window in a ref and rerender the option — see the **Performance / Streaming append (60 fps)** story.

## Tree-shaking with `/core`

ECharts is large (~1MB). Import from `/core` to register only what you use:

```tsx
import { Chart } from '@imlunahey/react-echarts/core';
import * as echarts from 'echarts/core';
import { LineChart, BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([LineChart, BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

<Chart option={option} />
```

Same `Chart` API; the bundle ships only the chart and component types you registered.

## Error handling

Most ECharts paths don't throw — the library only throws when an imperative method is called before mount. Catch `Chart.NotInitialized` (or the base `Chart.Error`):

```tsx
import { ReactEChartsError, NotInitialized } from '@imlunahey/react-echarts';

try {
  ref.current?.dispatchAction({ type: 'highlight' });
} catch (e) {
  if (e instanceof NotInitialized) {
    // chart not mounted yet — defer to an effect
  } else if (e instanceof ReactEChartsError) {
    // any other library error
  }
}
```

## Storybook

The repo ships a Storybook with one story per chart type and one per feature (events, theme, loading, connected groups, imperative ref, dynamic option, SVG renderer, tree-shaken core).

```sh
pnpm install
pnpm storybook
```

## Credits

Inspired by [`echarts-for-react`](https://github.com/hustcc/echarts-for-react). This rewrite trades the older API (`onChartReady`, `option` mutation semantics) for forwardRef + typed handle, ResizeObserver-based auto-resize, and a tree-shaken `/core` entry.

## License

MIT
