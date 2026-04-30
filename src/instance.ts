import type {
  ChartEvents,
  ChartLoading,
  EChartsInstance,
  EChartsLike,
  EChartsLocale,
  EChartsRenderer,
  EChartsTheme,
} from './types';

/**
 * Internal configuration for {@link createInstance}. Captures
 * everything that requires a re-init when changed (theme, renderer,
 * locale, devicePixelRatio).
 */
export type InitConfig = {
  theme?: EChartsTheme | undefined;
  renderer?: EChartsRenderer | undefined;
  devicePixelRatio?: number | undefined;
  locale?: EChartsLocale | undefined;
};

/**
 * Initialize an ECharts instance on a container element.
 */
export const createInstance = (
  echarts: EChartsLike,
  container: HTMLElement,
  config: InitConfig,
): EChartsInstance => {
  const opts: Parameters<EChartsLike['init']>[2] = {};
  if (config.renderer !== undefined) opts.renderer = config.renderer;
  if (config.devicePixelRatio !== undefined) opts.devicePixelRatio = config.devicePixelRatio;
  if (config.locale !== undefined) opts.locale = config.locale;
  return echarts.init(container, config.theme ?? null, opts);
};

/**
 * Bind ECharts events. Returns an unbind function that removes every
 * handler the call attached.
 */
export const bindEvents = (
  instance: EChartsInstance,
  events: ChartEvents | undefined,
): (() => void) => {
  if (!events) return () => {};
  const entries = Object.entries(events);
  for (const [name, handler] of entries) instance.on(name, handler);
  return () => {
    if (instance.isDisposed()) return;
    for (const [name, handler] of entries) instance.off(name, handler);
  };
};

/**
 * Apply the loading state. ECharts has no `getLoadingState`, so we
 * always call `showLoading` or `hideLoading` based on the prop.
 */
export const applyLoading = (instance: EChartsInstance, loading: ChartLoading | undefined): void => {
  if (loading === undefined || loading === false) {
    instance.hideLoading();
    return;
  }
  if (loading === true) {
    instance.showLoading();
    return;
  }
  instance.showLoading(loading.type, loading.opts);
};

/**
 * Watch the container for size changes and forward them to the
 * instance. Returns a teardown that disconnects the observer. Uses
 * `requestAnimationFrame` to coalesce bursts of resize events.
 */
export const observeResize = (instance: EChartsInstance, container: HTMLElement): (() => void) => {
  let frame = 0;
  const observer = new ResizeObserver(() => {
    if (frame !== 0) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!instance.isDisposed()) instance.resize();
    });
  });
  observer.observe(container);
  return () => {
    if (frame !== 0) cancelAnimationFrame(frame);
    observer.disconnect();
  };
};
