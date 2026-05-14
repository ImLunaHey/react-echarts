/**
 * Viewport-aware tooltip positioning for axis-triggered tooltips.
 *
 * Echarts' built-in tooltip has two failure modes on dashboards:
 *   - `confine: true` parks the tooltip against the chart edge on
 *     narrow tiles — the cursor catches up to it and the user ends
 *     up hovering on top of the tooltip itself.
 *   - `confine: false` lets the tooltip extend off the viewport at
 *     the page edges, where it gets clipped or pushes horizontal
 *     scroll onto `<body>`.
 *
 * Echarts also doesn't pass the chart's viewport offset to the
 * position callback for `trigger: 'axis'`, so a callback can't do
 * viewport-aware math on its own. We solve both: the caller passes
 * a `getContainer` closure that resolves the chart's container at
 * hover time, and we use its `getBoundingClientRect()` to translate
 * the chart-local cursor into viewport coords.
 *
 * Behaviour (mirrors `apps/app/console`'s `UPlotChart.tooltipPosition`):
 *   1. Pick the side (left/right of cursor) based on which half of
 *      the chart the cursor sits in.
 *   2. If the preferred side would extend past the viewport, flip
 *      to the opposite side of the cursor (rather than clamping,
 *      which parks the tooltip and lets the cursor catch up).
 *   3. Last-resort clamp to the viewport — only kicks in when the
 *      tooltip is wider than the viewport or the cursor is in a
 *      corner with no flip room.
 */

/** The echarts position callback signature, narrowed to what we use. */
export type TooltipPositionCallback = (
  point: [number, number],
  params: unknown,
  dom: HTMLElement,
  rect: unknown,
  size: { contentSize: [number, number]; viewSize: [number, number] },
) => [number, number];

interface SmartTooltipPositionOptions {
  /** Returns the chart's container element. Read at hover time so
   * the rect is always fresh (resizes, scrolls, etc.). */
  getContainer: () => HTMLElement | null;
  /**
   * Pixel gap between the cursor and the nearest tooltip edge.
   * Defaults to `12`.
   */
  offset?: number;
  /**
   * Pixel padding kept between the tooltip and the viewport edge —
   * the tooltip won't be positioned within this many pixels of the
   * viewport's left/right/top/bottom. Defaults to `16`, which is
   * enough to clear a typical `shadow-lg` box-shadow.
   */
  viewportPadding?: number;
  /**
   * Fallback tooltip width (in pixels) used when the rendered
   * element's measured width is `0` (first hover, before the
   * tooltip has been laid out). Defaults to `320`.
   */
  fallbackWidth?: number;
}

/**
 * Build a tooltip `position` callback bound to a specific chart
 * container. The returned function is suitable for passing directly
 * to echarts' `tooltip.position` option.
 */
export const createSmartTooltipPosition = ({
  getContainer,
  offset = 12,
  viewportPadding = 16,
  fallbackWidth = 320,
}: SmartTooltipPositionOptions): TooltipPositionCallback => {
  return (point, _params, dom, _rect, size) => {
    const [mx, my] = point;
    const measured =
      dom && typeof dom.getBoundingClientRect === 'function'
        ? dom.getBoundingClientRect()
        : null;
    // Prefer the measured (rendered) width; fall back to echarts'
    // intrinsic measurement, then to a sensible default before the
    // first measurement happens.
    const ttW = Math.max(
      measured?.width ?? 0,
      size.contentSize[0],
      fallbackWidth,
    );
    const ttH = measured?.height || size.contentSize[1] || 100;
    const [chartW] = size.viewSize;
    const pad = viewportPadding;
    const docEl =
      typeof document !== 'undefined' ? document.documentElement : null;
    const vw = docEl?.clientWidth ?? ttW + 32;
    const vh = docEl?.clientHeight ?? ttH + 32;
    const container = getContainer();
    const chartRect = container?.getBoundingClientRect() ?? null;
    const baseX = chartRect?.left ?? 0;
    const baseY = chartRect?.top ?? 0;
    const cursorAbsX = baseX + mx;
    const goLeft = mx > chartW / 2;
    let xAbs = goLeft
      ? cursorAbsX - ttW - offset
      : cursorAbsX + offset;
    // Flip on viewport overflow rather than clamping — clamping
    // parks the tooltip against the edge and the cursor catches up.
    if (xAbs < pad) xAbs = cursorAbsX + offset;
    if (xAbs + ttW > vw - pad) xAbs = cursorAbsX - ttW - offset;
    // Last-resort clamp: tooltip wider than the viewport, or cursor
    // in a corner with no room to flip.
    if (xAbs < pad) xAbs = pad;
    if (xAbs + ttW > vw - pad) xAbs = Math.max(pad, vw - ttW - pad);
    let yAbs = baseY + my - ttH / 2;
    if (yAbs < pad) yAbs = pad;
    if (yAbs + ttH > vh - pad) yAbs = Math.max(pad, vh - ttH - pad);
    // Echarts adds the chart's offset itself when `appendToBody: true`,
    // and ignores it otherwise — but in both cases interprets the
    // return value as chart-relative coords.
    return [xAbs - baseX, yAbs - baseY];
  };
};

interface OptionWithTooltip {
  tooltip?:
    | {
        position?: unknown;
        smartPosition?: boolean;
      }
    | undefined
    | unknown;
}

/**
 * Inject the smart position callback into an echarts option's
 * tooltip config when the caller hasn't supplied one. Mutates the
 * `option` object's `tooltip` entry in place (or replaces it with
 * a copy that has the position attached).
 *
 * Opt-out: pass `tooltip: { smartPosition: false }` (or supply your
 * own `position` callback) to disable. Tooltips without a `trigger`
 * still get the callback — echarts uses the axis trigger by default
 * when a chart has cartesian axes.
 */
export const applySmartTooltipPosition = <T extends OptionWithTooltip>(
  option: T,
  getContainer: () => HTMLElement | null,
): T => {
  const tooltip = option.tooltip;
  if (!tooltip || typeof tooltip !== 'object') return option;
  const t = tooltip as {
    position?: unknown;
    smartPosition?: boolean;
  };
  if (t.smartPosition === false) return option;
  if (t.position !== undefined) return option;
  const position = createSmartTooltipPosition({ getContainer });
  // Strip the opt-in marker before echarts sees it (it'd otherwise
  // log a "unknown property" warning at devtools verbosity).
  const { smartPosition: _ignored, ...rest } = t;
  return {
    ...option,
    tooltip: { ...rest, position },
  } as T;
};
