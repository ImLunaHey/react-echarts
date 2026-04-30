import type { CSSProperties } from 'react';

/**
 * A theme used at chart construction time — either the name of a theme
 * registered via `echarts.registerTheme`, or an inline theme object.
 * Changing this prop disposes and re-creates the underlying instance.
 */
export type EChartsTheme = string | Record<string, unknown>;

/**
 * Rendering backend. `'canvas'` is the default; `'svg'` renders a
 * scalable SVG (useful for SSR snapshots and high-DPI print). Changing
 * this prop disposes and re-creates the underlying instance.
 */
export type EChartsRenderer = 'canvas' | 'svg';

/**
 * Locale string (e.g. `'EN'`, `'ZH'`, or a custom registered locale).
 * Changing this prop disposes and re-creates the underlying instance.
 */
export type EChartsLocale = string;

/**
 * Loose ECharts event payload — the exact shape varies per event name.
 * Cast to a specific type from `echarts` if you need precise fields.
 */
export type ChartEventParams = Record<string, unknown>;

export type ChartEventHandler = (params: ChartEventParams) => void;

/**
 * Map of ECharts event names to handlers. Common keys:
 * `'click'`, `'dblclick'`, `'mouseover'`, `'mouseout'`,
 * `'legendselectchanged'`, `'datazoom'`, `'brushselected'`,
 * `'globalcursortaken'`, `'rendered'`, `'finished'`. See ECharts docs
 * for the full list.
 *
 * Handlers are re-bound when their identity changes — wrap inline
 * functions in `useCallback` if you'd like to avoid the rebind cost.
 */
export type ChartEvents = Record<string, ChartEventHandler>;

/**
 * Loading state. `true` shows ECharts' default loading animation;
 * pass an object to choose a registered loading effect or pass options.
 */
export type ChartLoading =
  | boolean
  | {
      /** Loading effect name, registered via `echarts.registerLoading`. */
      type?: string;
      /** Options forwarded to the loading effect. */
      opts?: Record<string, unknown>;
    };

/**
 * The slice of the ECharts instance API this library uses. The full
 * type lives in the `echarts` package — we only require the subset
 * below so the library can target either the full or core build.
 */
export type EChartsInstance = {
  setOption(option: unknown, opts?: { notMerge?: boolean; lazyUpdate?: boolean; silent?: boolean }): void;
  resize(opts?: { width?: number | 'auto'; height?: number | 'auto'; silent?: boolean }): void;
  dispatchAction(payload: { type: string } & Record<string, unknown>): void;
  clear(): void;
  dispose(): void;
  isDisposed(): boolean;
  showLoading(type?: string, opts?: Record<string, unknown>): void;
  hideLoading(): void;
  on(event: string, handler: ChartEventHandler): void;
  off(event: string, handler?: ChartEventHandler): void;
  group: string;
};

/**
 * The slice of the `echarts` namespace this library calls into. Both
 * the full `echarts` build and `echarts/core` satisfy it. The factory
 * accepts any object matching this shape.
 */
export type EChartsLike = {
  init(
    container: HTMLElement,
    theme?: EChartsTheme | null,
    opts?: {
      renderer?: EChartsRenderer;
      devicePixelRatio?: number;
      locale?: EChartsLocale;
      width?: number | 'auto';
      height?: number | 'auto';
      useDirtyRect?: boolean;
    },
  ): EChartsInstance;
  connect(group: string | EChartsInstance[]): void;
  disconnect(group: string): void;
};

/**
 * Imperative handle exposed via `ref` on `<Chart>`. Use to reach into
 * the ECharts instance for things React state can't express cleanly:
 * dispatching highlights, forcing a resize, toggling loading.
 *
 * Methods throw {@link NotInitialized} if called before mount or after
 * unmount. Inside an effect or event handler the chart is always ready.
 */
export type ChartHandle = {
  /**
   * The underlying ECharts instance, or `null` if not yet mounted.
   * Prefer the typed methods on this handle when possible — they throw
   * a clearer error if called too early.
   */
  getInstance(): EChartsInstance | null;
  /**
   * Dispatch an action on the chart, e.g. `{ type: 'highlight',
   * seriesIndex: 0, dataIndex: 3 }`. See ECharts docs for the action
   * vocabulary.
   */
  dispatchAction(payload: { type: string } & Record<string, unknown>): void;
  /**
   * Force an immediate resize. The chart already auto-resizes via
   * `ResizeObserver`; call this only when the observer can't see the
   * change (e.g. a CSS variable change that affects layout).
   */
  resize(opts?: { width?: number | 'auto'; height?: number | 'auto'; silent?: boolean }): void;
  /** Clear the chart's option and animations. */
  clear(): void;
  /** Show ECharts' built-in loading animation. */
  showLoading(type?: string, opts?: Record<string, unknown>): void;
  /** Hide the loading animation. */
  hideLoading(): void;
};

/**
 * Props for {@link Chart}. The required prop is `option`; everything
 * else is optional with sensible defaults.
 *
 * `option` is consumed by reference: pass a new object (or memoize the
 * old one) to trigger an update. Mutating the same object in place
 * will not re-render the chart.
 */
export type ChartProps = {
  /** ECharts option object. Type as `EChartsOption` from `echarts` for full IntelliSense. */
  option: Record<string, unknown>;
  /** Registered theme name or inline theme object. Changing this disposes and recreates the chart. */
  theme?: EChartsTheme;
  /** `'canvas'` (default) or `'svg'`. Changing this disposes and recreates the chart. */
  renderer?: EChartsRenderer;
  /** Device pixel ratio. Defaults to `window.devicePixelRatio`. Canvas renderer only. */
  devicePixelRatio?: number;
  /** Locale string. Changing this disposes and recreates the chart. */
  locale?: EChartsLocale;
  /** If true, replaces the previous option entirely instead of merging. Default false. */
  notMerge?: boolean;
  /** If true, defers the redraw to the next frame. Default false. */
  lazyUpdate?: boolean;
  /** If true, suppresses events triggered by the option update. Default false. */
  silent?: boolean;
  /**
   * Group identifier. Charts in the same group can be linked via
   * `connect(group)` so tooltips and dataZoom stay in sync.
   */
  group?: string;
  /** Show the loading animation. `true` for defaults, or pass `{ type, opts }`. */
  loading?: ChartLoading;
  /** Map of ECharts event names to handlers. */
  onEvents?: ChartEvents;
  /** Called once with the new instance after mount. */
  onInit?: (instance: EChartsInstance) => void;
  /** className for the container div. */
  className?: string;
  /** Inline styles for the container. Defaults to `{ width: '100%', height: '100%' }`. */
  style?: CSSProperties;
};
