import type { ReactNode } from 'react';

/**
 * Wraps a story in a sized box so the chart has a layout to fill.
 * `<Chart>` defaults to 100% × 100% and needs a parent with dimensions.
 */
export const SizedBox = ({
  children,
  width = 640,
  height = 360,
}: {
  children: ReactNode;
  width?: number | string;
  height?: number | string;
}) => (
  <div style={{ width, height, padding: 12, background: 'transparent' }}>{children}</div>
);
