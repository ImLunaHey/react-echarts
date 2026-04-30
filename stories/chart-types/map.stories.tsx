import type { Meta, StoryObj } from '@storybook/react-vite';
import * as echarts from 'echarts';
import { useEffect, useState } from 'react';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

/**
 * Inline geoJSON of four simplified country-like polygons. ECharts v5
 * no longer ships world/region maps — register your own geoJSON via
 * `echarts.registerMap(name, geoJson)` first, then reference the same
 * `name` in the series.
 */
const DEMO_REGIONS = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      properties: { name: 'Argonia' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-110, 25],
            [-80, 25],
            [-80, 55],
            [-110, 55],
            [-110, 25],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Brivia' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-70, 25],
            [-30, 25],
            [-30, 55],
            [-70, 55],
            [-70, 25],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Cardonia' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-110, -10],
            [-80, -10],
            [-80, 20],
            [-110, 20],
            [-110, -10],
          ],
        ],
      },
    },
    {
      type: 'Feature' as const,
      properties: { name: 'Daleria' },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [-70, -10],
            [-30, -10],
            [-30, 20],
            [-70, 20],
            [-70, -10],
          ],
        ],
      },
    },
  ],
};

let registered = false;
const ensureRegistered = () => {
  if (registered) return;
  // ECharts' types don't include `registerMap` on the namespace export, but
  // it exists at runtime. Cast to access it.
  (echarts as unknown as { registerMap: (name: string, geo: unknown) => void }).registerMap(
    'demo-regions',
    DEMO_REGIONS,
  );
  registered = true;
};

const RegisteredMap = (args: Parameters<typeof ControlledChart>[0]) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureRegistered();
    setReady(true);
  }, []);
  if (!ready) return null;
  return <ControlledChart {...args} />;
};

const meta: Meta<typeof RegisteredMap> = {
  title: 'Chart types/Map',
  component: RegisteredMap,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 720, height: 420 },
  parameters: {
    docs: {
      description: {
        component:
          'ECharts v5 no longer ships built-in maps. Register a geoJSON with `echarts.registerMap("name", geoJson)` once, then reference the same `name` in the series. This story uses a tiny inline geoJSON of four made-up regions to keep the demo self-contained.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RegisteredMap>;

const populations: Array<{ name: string; value: number }> = [
  { name: 'Argonia', value: 41_200_000 },
  { name: 'Brivia', value: 18_700_000 },
  { name: 'Cardonia', value: 9_400_000 },
  { name: 'Daleria', value: 27_900_000 },
];

export const Choropleth: Story = {
  args: {
    option: {
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number }) =>
          `${p.name}<br/>${(p.value || 0).toLocaleString()} people`,
      },
      visualMap: {
        min: 0,
        max: 50_000_000,
        left: 'left',
        bottom: 12,
        text: ['High', 'Low'],
        calculable: true,
        inRange: { color: ['#e0f3f8', '#74add1', '#4575b4', '#313695'] },
      },
      series: [
        {
          type: 'map',
          map: 'demo-regions',
          roam: true,
          label: { show: true },
          emphasis: {
            label: { show: true, fontWeight: 'bold' },
            itemStyle: { areaColor: '#ffd180' },
          },
          data: populations,
        },
      ],
    },
  },
};
