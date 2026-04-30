import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  type ForwardRefExoticComponent,
  type RefAttributes,
  type RefObject,
} from 'react';

import { NotInitialized } from './errors';
import {
  applyLoading,
  bindEvents,
  createInstance,
  observeResize,
  type InitConfig,
} from './instance';
import type {
  ChartHandle,
  ChartProps,
  EChartsInstance,
  EChartsLike,
  EChartsLocale,
  EChartsRenderer,
  EChartsTheme,
} from './types';

const DEFAULT_STYLE = { width: '100%', height: '100%' } as const;

/**
 * `useLayoutEffect` warns on the server. Fall back to `useEffect`
 * during SSR — the chart can't render without a DOM anyway.
 */
const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Stringify the inputs that require a re-init. Used as a `useEffect`
 * dep so the instance is rebuilt only when one of them actually
 * changes (object themes are compared by reference).
 */
const initKey = (
  theme: EChartsTheme | undefined,
  renderer: EChartsRenderer | undefined,
  locale: EChartsLocale | undefined,
  devicePixelRatio: number | undefined,
): string => {
  const themeKey =
    typeof theme === 'string' ? `s:${theme}` : theme === undefined ? 'u' : 'o';
  return `${themeKey}|${renderer ?? 'd'}|${locale ?? 'd'}|${devicePixelRatio ?? 'd'}`;
};

/**
 * Build the {@link useChart} hook bound to a specific `echarts` build.
 * Most consumers should use the pre-bound export from
 * `@imlunahey/react-echarts` (full) or `@imlunahey/react-echarts/core`
 * (tree-shaken). Call this directly only for custom echarts builds.
 */
export const createUseChart = (echarts: EChartsLike) => {
  return function useChart<T extends HTMLElement>(
    container: RefObject<T | null>,
    props: Omit<ChartProps, 'className' | 'style'>,
  ): ChartHandle {
    const instanceRef = useRef<EChartsInstance | null>(null);
    const propsRef = useRef(props);
    propsRef.current = props;

    const handle = useMemo<ChartHandle>(
      () => ({
        getInstance: () => instanceRef.current,
        dispatchAction: (payload) => {
          const instance = instanceRef.current;
          if (!instance) {
            throw new NotInitialized('dispatchAction called before chart mounted');
          }
          instance.dispatchAction(payload);
        },
        resize: (opts) => {
          const instance = instanceRef.current;
          if (!instance) throw new NotInitialized('resize called before chart mounted');
          instance.resize(opts);
        },
        clear: () => {
          const instance = instanceRef.current;
          if (!instance) throw new NotInitialized('clear called before chart mounted');
          instance.clear();
        },
        showLoading: (type, opts) => {
          const instance = instanceRef.current;
          if (!instance) throw new NotInitialized('showLoading called before chart mounted');
          instance.showLoading(type, opts);
        },
        hideLoading: () => {
          const instance = instanceRef.current;
          if (!instance) throw new NotInitialized('hideLoading called before chart mounted');
          instance.hideLoading();
        },
      }),
      [],
    );

    const { theme, renderer, locale, devicePixelRatio } = props;
    const initSig = initKey(theme, renderer, locale, devicePixelRatio);

    useIsoLayoutEffect(() => {
      const el = container.current;
      if (!el) return;

      const config: InitConfig = {
        theme,
        renderer,
        devicePixelRatio,
        locale,
      };
      const instance = createInstance(echarts, el, config);
      instanceRef.current = instance;

      const current = propsRef.current;
      if (current.group !== undefined) instance.group = current.group;
      instance.setOption(current.option, {
        notMerge: current.notMerge ?? false,
        lazyUpdate: current.lazyUpdate ?? false,
        silent: current.silent ?? false,
      });
      applyLoading(instance, current.loading);
      current.onInit?.(instance);

      const stopResize = observeResize(instance, el);

      return () => {
        stopResize();
        instanceRef.current = null;
        if (!instance.isDisposed()) instance.dispose();
      };
      // initSig captures every input that requires a fresh instance.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initSig]);

    const { option, notMerge, lazyUpdate, silent } = props;
    useIsoLayoutEffect(() => {
      const instance = instanceRef.current;
      if (!instance || instance.isDisposed()) return;
      instance.setOption(option, {
        notMerge: notMerge ?? false,
        lazyUpdate: lazyUpdate ?? false,
        silent: silent ?? false,
      });
    }, [option, notMerge, lazyUpdate, silent]);

    const { group } = props;
    useIsoLayoutEffect(() => {
      const instance = instanceRef.current;
      if (!instance || instance.isDisposed()) return;
      instance.group = group ?? '';
    }, [group]);

    const { loading } = props;
    useIsoLayoutEffect(() => {
      const instance = instanceRef.current;
      if (!instance || instance.isDisposed()) return;
      applyLoading(instance, loading);
    }, [loading]);

    const { onEvents } = props;
    useIsoLayoutEffect(() => {
      const instance = instanceRef.current;
      if (!instance || instance.isDisposed()) return;
      return bindEvents(instance, onEvents);
    }, [onEvents]);

    return handle;
  };
};

/**
 * Build the {@link Chart} component bound to a specific `echarts`
 * build. Most consumers should use the pre-bound export.
 */
export const createChart = (
  echarts: EChartsLike,
): ForwardRefExoticComponent<ChartProps & RefAttributes<ChartHandle>> => {
  const useChart = createUseChart(echarts);

  const Chart = forwardRef<ChartHandle, ChartProps>(function Chart(props, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const { className, style, ...rest } = props;
    const handle = useChart(containerRef, rest);
    useImperativeHandle(ref, () => handle, [handle]);
    return (
      <div
        ref={containerRef}
        className={className}
        style={style ?? DEFAULT_STYLE}
      />
    );
  });

  Chart.displayName = 'Chart';
  return Chart;
};

/**
 * Re-export {@link echarts.connect} bound to the provided build.
 */
export const createConnect = (echarts: EChartsLike): EChartsLike['connect'] =>
  echarts.connect.bind(echarts);

/**
 * Re-export {@link echarts.disconnect} bound to the provided build.
 */
export const createDisconnect = (echarts: EChartsLike): EChartsLike['disconnect'] =>
  echarts.disconnect.bind(echarts);
