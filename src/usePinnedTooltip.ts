import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

import type { ChartEventHandler, ChartEvents, ChartHandle, EChartsInstance } from './types';

/**
 * Position the tooltip is currently pinned to. `dataIndex` is what
 * echarts uses to address a point in an axis-trigger tooltip;
 * `seriesIndex` is needed for `'item'`-trigger tooltips.
 */
export interface PinnedPosition {
  seriesIndex: number;
  dataIndex: number;
}

export interface UsePinnedTooltipOptions {
  /**
   * Ref to the chart's `ChartHandle`. Required so the hook can
   * `dispatchAction({ type: 'showTip' | 'hideTip' })` to drive the
   * tooltip imperatively.
   */
  chartRef: RefObject<ChartHandle | null>;
  /**
   * Ref to the wrapper element around the chart. Used to:
   *   - detect "click outside" for unpinning
   *   - bind `onMouseLeave` for unpinning when the cursor leaves
   *
   * Pass `null` if you only want zr-level click pinning + Esc.
   */
  wrapperRef?: RefObject<HTMLElement | null>;
  /**
   * Default `'axis'`. Controls how clicks are translated into a
   * `PinnedPosition`:
   *   - `'axis'`: pins to the dataIndex the axis pointer was last
   *     over. `seriesIndex` is fixed at 0 (axis-trigger tooltips show
   *     all series at that x value, so it's not meaningful).
   *   - `'item'`: pins only when the click landed on a series item;
   *     uses that item's seriesIndex + dataIndex.
   */
  trigger?: 'axis' | 'item';
  /** Default `true`. Esc key clears the pin. */
  unpinOnEscape?: boolean;
  /** Default `true`. Clicking outside the wrapper clears the pin. */
  unpinOnClickOutside?: boolean;
  /** Default `true`. Mouse leaving the wrapper clears the pin. */
  unpinOnMouseLeave?: boolean;
}

export interface UsePinnedTooltipResult {
  /** The currently-pinned position, or `null`. */
  pinned: PinnedPosition | null;
  /** Imperative setter — pass `null` to unpin. */
  setPinned: (next: PinnedPosition | null) => void;
  /**
   * Wire onto `<Chart onInit={...}>`. Installs the zr-level click
   * handler that pins/unpins from anywhere on the chart canvas. If
   * you also use `createZoom`, compose: `(i) => { tooltip.onInit(i);
   * zoom.onInit(i); }`.
   */
  onInit: (instance: EChartsInstance) => void;
  /**
   * Merge into `<Chart onEvents={...}>`. Tracks the axis pointer's
   * current `dataIndex` (axis trigger) or registers the item click
   * (item trigger).
   */
  events: ChartEvents;
  /**
   * Bind onto your wrapper as `onMouseLeave={...}`. Wired here so the
   * hook can centralize the unpin logic.
   */
  onMouseLeave: () => void;
}

interface ZrLike {
  on: (event: string, handler: (e: { target?: unknown }) => void) => void;
}

/**
 * Pin-on-click tooltip behavior for echarts charts. Handles the
 * click-anywhere-to-pin choreography that's tedious to wire by hand:
 * tracks the axis pointer's current dataIndex, pins/unpins from any
 * click on the canvas, dismisses on Esc, mouse leave, and clicks
 * outside the wrapper.
 *
 * Drives the tooltip imperatively via `showTip`/`hideTip`. To make
 * that work, you also need to flip the tooltip's `triggerOn` to
 * `'none'` (and ideally `alwaysShowContent: true`) in your option
 * object while `pinned` is set:
 *
 * @example
 * const tooltip = usePinnedTooltip({ chartRef, wrapperRef });
 *
 * const option = useMemo(() => ({
 *   tooltip: {
 *     trigger: 'axis',
 *     enterable: tooltip.pinned !== null,
 *     alwaysShowContent: tooltip.pinned !== null,
 *     triggerOn: tooltip.pinned ? 'none' : 'mousemove|click',
 *   },
 *   // ...
 * }), [tooltip.pinned]);
 *
 * return (
 *   <div ref={wrapperRef} onMouseLeave={tooltip.onMouseLeave}>
 *     <Chart
 *       ref={chartRef}
 *       option={option}
 *       onInit={tooltip.onInit}
 *       onEvents={tooltip.events}
 *     />
 *   </div>
 * );
 */
export const usePinnedTooltip = (options: UsePinnedTooltipOptions): UsePinnedTooltipResult => {
  const {
    chartRef,
    wrapperRef,
    trigger = 'axis',
    unpinOnEscape = true,
    unpinOnClickOutside = true,
    unpinOnMouseLeave = true,
  } = options;

  const [pinned, setPinned] = useState<PinnedPosition | null>(null);

  // Tracks the dataIndex currently under the axis pointer, so a
  // generic click anywhere on the chart can pin to it.
  const hoveredRef = useRef<PinnedPosition | null>(null);

  // Drive the tooltip imperatively. Pinning ⇢ showTip; unpinning ⇢
  // hideTip. The consumer's option needs `triggerOn: 'none'` when
  // pinned, otherwise mousemove will dismiss it.
  useEffect(() => {
    const handle = chartRef.current;
    if (!handle) return;
    if (pinned) {
      handle.dispatchAction({ type: 'showTip', ...pinned });
    } else {
      handle.dispatchAction({ type: 'hideTip' });
    }
  }, [pinned, chartRef]);

  // Esc unpins.
  useEffect(() => {
    if (!unpinOnEscape || !pinned) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPinned(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned, unpinOnEscape]);

  // Click outside the wrapper unpins.
  useEffect(() => {
    if (!unpinOnClickOutside || !pinned || !wrapperRef) return;
    const onDown = (e: MouseEvent) => {
      const wrapper = wrapperRef.current;
      if (wrapper && wrapper.contains(e.target as Node)) return;
      setPinned(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [pinned, unpinOnClickOutside, wrapperRef]);

  const onInit = useCallback(
    (instance: EChartsInstance) => {
      const zr = (instance as unknown as { getZr: () => ZrLike }).getZr();
      zr.on('click', (e) => {
        if (trigger === 'item') {
          // For item-trigger, pinning happens via the high-level click
          // event in `events.click`. Blank-area zr clicks just unpin.
          if (!e.target) setPinned((prev) => (prev ? null : prev));
          return;
        }
        // Axis trigger: pin to whatever the axis pointer last tracked.
        const next = hoveredRef.current;
        if (next === null) {
          setPinned((prev) => (prev ? null : prev));
          return;
        }
        setPinned((prev) =>
          prev && prev.dataIndex === next.dataIndex && prev.seriesIndex === next.seriesIndex
            ? null
            : next
        );
      });
    },
    [trigger]
  );

  const events = useMemo<ChartEvents>(() => {
    const out: Record<string, ChartEventHandler> = {};
    if (trigger === 'axis') {
      out.updateAxisPointer = (params) => {
        const dataIndex = params.dataIndex as number | undefined;
        if (typeof dataIndex === 'number') {
          hoveredRef.current = { seriesIndex: 0, dataIndex };
        } else {
          hoveredRef.current = null;
        }
      };
      out.globalout = () => {
        hoveredRef.current = null;
      };
    } else {
      out.click = (params) => {
        const seriesIndex = params.seriesIndex as number | undefined;
        const dataIndex = params.dataIndex as number | undefined;
        if (typeof seriesIndex !== 'number' || typeof dataIndex !== 'number') return;
        setPinned((prev) =>
          prev && prev.seriesIndex === seriesIndex && prev.dataIndex === dataIndex
            ? null
            : { seriesIndex, dataIndex }
        );
      };
    }
    return out;
  }, [trigger]);

  const onMouseLeave = useCallback(() => {
    if (unpinOnMouseLeave && pinned) setPinned(null);
  }, [pinned, unpinOnMouseLeave]);

  return { pinned, setPinned, onInit, events, onMouseLeave };
};
