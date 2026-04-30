import type { Meta, StoryObj } from '@storybook/react-vite';
import * as echarts from 'echarts';
import { useEffect, useState } from 'react';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const WORLD_GEOJSON_URL =
  'https://cdn.jsdelivr.net/gh/johan/world.geo.json@master/countries.geo.json';

let registered: Promise<void> | null = null;

/**
 * Fetch and register a world countries geoJSON exactly once. Subsequent
 * stories that need it await the same promise. ECharts' types don't
 * include `registerMap`, so we cast to access it.
 */
const ensureWorldRegistered = (): Promise<void> => {
  if (registered) return registered;
  registered = fetch(WORLD_GEOJSON_URL)
    .then((r) => r.json())
    .then((geo) => {
      (echarts as unknown as { registerMap: (name: string, geo: unknown) => void }).registerMap(
        'world',
        geo,
      );
    });
  return registered;
};

const RegisteredWorldMap = (args: Parameters<typeof ControlledChart>[0]) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    ensureWorldRegistered().then(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <div
        style={{
          width: args.width ?? 720,
          height: args.height ?? 420,
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'monospace',
          fontSize: 12,
          color: '#888',
        }}
      >
        Loading world map…
      </div>
    );
  }
  return <ControlledChart {...args} />;
};

const meta: Meta<typeof RegisteredWorldMap> = {
  title: 'Chart types/Map',
  component: RegisteredWorldMap,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 800, height: 460 },
  parameters: {
    docs: {
      description: {
        component:
          'ECharts v5 no longer ships built-in maps. This story fetches a public world-countries geoJSON from jsDelivr, registers it once via `echarts.registerMap("world", geoJson)`, and uses it for every map demo. Pass the registered name via `series[].map`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof RegisteredWorldMap>;

// Sample data — names match the geoJSON's `properties.name`.
const populationMillions = [
  { name: 'China', value: 1412 },
  { name: 'India', value: 1408 },
  { name: 'United States of America', value: 333 },
  { name: 'Indonesia', value: 274 },
  { name: 'Pakistan', value: 231 },
  { name: 'Nigeria', value: 219 },
  { name: 'Brazil', value: 215 },
  { name: 'Bangladesh', value: 169 },
  { name: 'Russia', value: 144 },
  { name: 'Mexico', value: 127 },
  { name: 'Japan', value: 125 },
  { name: 'Ethiopia', value: 121 },
  { name: 'Philippines', value: 115 },
  { name: 'Egypt', value: 109 },
  { name: 'Vietnam', value: 98 },
  { name: 'Germany', value: 84 },
  { name: 'Turkey', value: 84 },
  { name: 'Iran', value: 87 },
  { name: 'United Kingdom', value: 67 },
  { name: 'France', value: 67 },
  { name: 'Italy', value: 59 },
  { name: 'South Africa', value: 60 },
  { name: 'Canada', value: 39 },
  { name: 'Australia', value: 26 },
  { name: 'Argentina', value: 46 },
  { name: 'Spain', value: 47 },
  { name: 'Saudi Arabia', value: 36 },
  { name: 'South Korea', value: 51 },
];

export const WorldChoropleth: Story = {
  args: {
    option: {
      title: { text: 'World population', subtext: 'Millions of people, 2023', left: 'center' },
      tooltip: {
        trigger: 'item',
        formatter: (p: { name: string; value: number | undefined }) =>
          p.value === undefined || Number.isNaN(p.value)
            ? p.name
            : `${p.name}<br/><b>${p.value.toLocaleString()}M</b>`,
      },
      visualMap: {
        min: 0,
        max: 1500,
        left: 'left',
        bottom: 24,
        text: ['1,500M', '0'],
        calculable: true,
        inRange: { color: ['#e0f3f8', '#abd9e9', '#74add1', '#4575b4', '#313695'] },
      },
      series: [
        {
          name: 'Population (M)',
          type: 'map',
          map: 'world',
          roam: true,
          itemStyle: { areaColor: '#f4f4f4', borderColor: '#bbb' },
          emphasis: {
            label: { show: true, fontWeight: 'bold' },
            itemStyle: { areaColor: '#ffd180' },
          },
          select: { itemStyle: { areaColor: '#ffab40' } },
          data: populationMillions,
        },
      ],
    },
  },
};
