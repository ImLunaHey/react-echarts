import { useMemo, useSyncExternalStore } from 'react';

/**
 * Resolves CSS custom properties (`var(--…)`) to concrete strings
 * read off `document.documentElement`. Useful when a chart is rendered
 * with the canvas backend — canvas can't resolve CSS variables at
 * paint time, so axis/grid/text colors driven by your design system
 * have to be passed in as plain values.
 *
 * The hook re-reads when the `<html>` element's `class` or
 * `data-theme` attribute changes (the usual signals when a theme
 * toggle flips). Pass an `invalidationKey` if your app has a parallel
 * way of representing theme state and you want to be sure the hook
 * re-reads on prop change too.
 *
 * Falls back to {@link options.fallback} (or undefined) for variables
 * that don't resolve (e.g. server render, missing variable).
 */
export interface UseResolvedColorsOptions {
  /**
   * Default values returned when a CSS variable doesn't resolve. Maps
   * variable names (with the leading `--`) to a plain color string.
   */
  fallback?: Readonly<Record<string, string>>;
  /**
   * Extra string mixed into the snapshot so the hook re-reads when
   * this changes — useful if your theme prop flips before the
   * underlying `<html>` class swap lands.
   */
  invalidationKey?: string;
}

const themeListeners = new Set<() => void>();
let themeObserver: MutationObserver | null = null;

const subscribeThemeChange = (callback: () => void): (() => void) => {
  themeListeners.add(callback);
  if (typeof window !== 'undefined' && !themeObserver) {
    themeObserver = new MutationObserver(() => {
      for (const cb of themeListeners) cb();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
  }
  return () => {
    themeListeners.delete(callback);
    if (themeListeners.size === 0 && themeObserver) {
      themeObserver.disconnect();
      themeObserver = null;
    }
  };
};

const readResolvedColors = (
  varNames: readonly string[],
  fallback: Readonly<Record<string, string>> | undefined
): Record<string, string> => {
  const out: Record<string, string> = { ...(fallback ?? {}) };
  if (typeof window === 'undefined') return out;
  const computed = getComputedStyle(document.documentElement);
  for (const name of varNames) {
    const value = computed.getPropertyValue(name).trim();
    if (value) out[name] = value;
  }
  return out;
};

export const useResolvedColors = <const Names extends readonly string[]>(
  varNames: Names,
  options?: UseResolvedColorsOptions
): Record<Names[number], string> => {
  // The snapshot is a single string of all values we care about so
  // useSyncExternalStore can dedupe on a stable reference. The
  // `invalidationKey` lets the consumer force a re-read.
  const snapshot = useSyncExternalStore(
    subscribeThemeChange,
    () => {
      const c = readResolvedColors(varNames, options?.fallback);
      let s = options?.invalidationKey ?? '';
      for (const name of varNames) s += `|${c[name] ?? ''}`;
      return s;
    },
    () => `${options?.invalidationKey ?? ''}|fallback`
  );

  return useMemo(() => {
    const out = {} as Record<Names[number], string>;
    const parts = snapshot.split('|');
    // skip parts[0] (invalidationKey)
    for (let i = 0; i < varNames.length; i++) {
      const name = varNames[i] as Names[number];
      const value = parts[i + 1];
      out[name] = value || options?.fallback?.[name] || '';
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot]);
};
