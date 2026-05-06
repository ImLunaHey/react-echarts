import type { ChartEvents, EChartsInstance } from './types';

/**
 * The range selected by a drag-to-zoom interaction. `min`/`max` are
 * the raw axis values: timestamps for `time` axes, indices for
 * `category` axes, numbers for `value` axes.
 */
export interface ZoomRange {
  x?: { min: number; max: number };
  y?: { min: number; max: number };
}

export interface CreateZoomConfig {
  /**
   * Which axis to zoom on. `'x'` is the most common (uPlot-like
   * horizontal selection); `'y'` for vertical-only selection;
   * `'xy'` for a 2-D rect.
   *
   * @default 'x'
   */
  axis?: 'x' | 'y' | 'xy';
  /**
   * Fired when the user releases a zoom selection. The brush
   * rectangle is cleared immediately after — the consumer fully owns
   * the zoom state (e.g. by reloading data for the new range).
   */
  onZoom: (range: ZoomRange) => void;
}

export interface ZoomBindings {
  /**
   * Merge into your `option` object. Adds an internal `brush`
   * configuration the package activates programmatically.
   */
  optionPatch: Record<string, unknown>;
  /**
   * Pass to `<Chart onInit={...}>`. Activates the brush cursor the
   * moment the chart mounts so users can drag immediately without
   * clicking a tool button first.
   */
  onInit: (instance: EChartsInstance) => void;
  /**
   * Merge into your `<Chart onEvents={...}>`. Listens for `brushEnd`
   * and dispatches the captured range to your `onZoom` callback.
   */
  events: ChartEvents;
}

interface BrushArea {
  brushType?: string;
  coordRange?: number[] | number[][];
}

interface BrushEndParams {
  areas?: BrushArea[];
}

const brushTypeFor = (axis: 'x' | 'y' | 'xy'): 'lineX' | 'lineY' | 'rect' => {
  if (axis === 'y') return 'lineY';
  if (axis === 'xy') return 'rect';
  return 'lineX';
};

/**
 * Wire up uPlot-style drag-to-zoom on an ECharts chart. The user
 * drags a region on the chart, and on release `onZoom` fires with the
 * selected axis range. Implemented via echarts' built-in `brush`.
 *
 * @example
 * const zoom = createZoom({
 *   onZoom: (range) => setTimeRange(range.x),
 * });
 * <Chart
 *   option={{ ...myOption, ...zoom.optionPatch }}
 *   onInit={zoom.onInit}
 *   onEvents={zoom.events}
 * />
 */
export const createZoom = (config: CreateZoomConfig): ZoomBindings => {
  const { axis = 'x', onZoom } = config;
  const brushType = brushTypeFor(axis);

  let instance: EChartsInstance | null = null;

  const armBrush = (i: EChartsInstance) => {
    i.dispatchAction({
      type: 'takeGlobalCursor',
      key: 'brush',
      brushOption: { brushType, brushMode: 'single' },
    });
  };

  return {
    optionPatch: {
      // Brush requires a `brush` config to register the area handler.
      // The cursor is activated programmatically in `onInit` below;
      // no toolbox UI is shown.
      brush: {
        xAxisIndex: axis === 'y' ? 'none' : 0,
        yAxisIndex: axis === 'x' ? 'none' : 0,
        brushType,
        brushMode: 'single',
        transformable: false,
        throttleType: 'debounce',
        throttleDelay: 0,
        brushStyle: {
          borderWidth: 1,
          color: 'rgba(120, 140, 200, 0.15)',
          borderColor: 'rgba(120, 140, 200, 0.6)',
        },
      },
    },

    onInit: (newInstance) => {
      instance = newInstance;
      armBrush(newInstance);
    },

    events: {
      brushEnd: (params) => {
        const areas = (params as BrushEndParams).areas ?? [];
        const area = areas[0];
        if (!area || !area.coordRange) {
          // Brush cleared — re-arm so the next drag works.
          if (instance && !instance.isDisposed()) armBrush(instance);
          return;
        }

        const range: ZoomRange = {};
        if (area.brushType === 'lineX' && Array.isArray(area.coordRange)) {
          const [min, max] = area.coordRange as number[];
          if (typeof min === 'number' && typeof max === 'number') range.x = { min, max };
        } else if (area.brushType === 'lineY' && Array.isArray(area.coordRange)) {
          const [min, max] = area.coordRange as number[];
          if (typeof min === 'number' && typeof max === 'number') range.y = { min, max };
        } else if (area.brushType === 'rect') {
          const cr = area.coordRange as number[][];
          if (Array.isArray(cr) && cr.length === 2) {
            const [xMin, xMax] = cr[0]!;
            const [yMin, yMax] = cr[1]!;
            if (typeof xMin === 'number' && typeof xMax === 'number') range.x = { min: xMin, max: xMax };
            if (typeof yMin === 'number' && typeof yMax === 'number') range.y = { min: yMin, max: yMax };
          }
        }

        // Clear the rectangle *before* firing `onZoom`. The consumer's
        // callback often triggers a parent re-render that can dispose
        // this instance, leaving any deferred clear with nothing to act
        // on. Clearing areas + re-arming the cursor is the minimum
        // sequence — `setOption(replaceMerge)`, `takeGlobalCursor`
        // exit, and `zr.refreshImmediately` were all tried and aren't
        // needed for echarts to drop the rendered shape.
        if (instance && !instance.isDisposed()) {
          instance.dispatchAction({ type: 'brush', areas: [] });
          armBrush(instance);
        }

        if (range.x || range.y) {
          onZoom(range);
        }
      },
    },
  };
};
