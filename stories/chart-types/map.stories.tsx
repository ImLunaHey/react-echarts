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

const BEEF_SVG_URL =
  'https://echarts.apache.org/examples/data/asset/geo/Beef_cuts_France.svg';

const registry: Map<string, Promise<void>> = new Map();

const registerEcharts = (name: string, payload: unknown) => {
  (echarts as unknown as { registerMap: (n: string, p: unknown) => void }).registerMap(name, payload);
};

/**
 * Fetch + register a map definition exactly once per name. Subsequent
 * mounts await the same promise.
 */
const ensureRegistered = (name: string, loader: () => Promise<unknown>): Promise<void> => {
  const cached = registry.get(name);
  if (cached) return cached;
  const promise = loader().then((payload) => registerEcharts(name, payload));
  registry.set(name, promise);
  return promise;
};

const ensureWorldRegistered = () =>
  ensureRegistered('world', () => fetch(WORLD_GEOJSON_URL).then((r) => r.json()));

const ensureBeefRegistered = () =>
  ensureRegistered('beef', () =>
    fetch(BEEF_SVG_URL)
      .then((r) => r.text())
      .then((svg) => ({ svg })),
  );

const useRegisteredMap = (loader: () => Promise<void>) => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    loader().then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ready;
};

const Loading = ({ width, height, label }: { width: number | string; height: number; label: string }) => (
  <div
    style={{
      width,
      height,
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#888',
    }}
  >
    {label}
  </div>
);

const RegisteredWorldMap = (args: Parameters<typeof ControlledChart>[0]) => {
  const ready = useRegisteredMap(ensureWorldRegistered);
  if (!ready) return <Loading width={args.width ?? 720} height={Number(args.height ?? 420)} label="Loading world map…" />;
  return <ControlledChart {...args} />;
};

const RegisteredBeefMap = (args: Parameters<typeof ControlledChart>[0]) => {
  const ready = useRegisteredMap(ensureBeefRegistered);
  if (!ready) return <Loading width={args.width ?? 720} height={Number(args.height ?? 420)} label="Loading SVG…" />;
  return <ControlledChart {...args} />;
};

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Map',
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 800, height: 460 },
  parameters: {
    docs: {
      description: {
        component:
          'ECharts v5 no longer ships built-in maps. Register your own via `echarts.registerMap(name, payload)` — `payload` is either a geoJSON object (`{type: "FeatureCollection", ...}`) or an SVG wrapper (`{svg: "<svg>...</svg>"}`). The same `<Chart>` component handles both. The first story uses a real world geoJSON; the second uses an SVG diagram so anything you can draw becomes an interactive choropleth.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

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
  render: (args) => <RegisteredWorldMap {...args} />,
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

// Sample data for the beef-cuts SVG. Region names match the SVG element
// labels — ECharts maps each `<path>` (or any element with an id/name) to
// a region you can color, hover, or click.
const beefCuts = [
  { name: 'Plat de joue', value: 1 },
  { name: 'Collier', value: 2 },
  { name: 'Basses côtes', value: 4 },
  { name: 'Côtes/entrecôtes', value: 5 },
  { name: 'Faux-filet', value: 6 },
  { name: 'Filet', value: 7 },
  { name: 'Rumsteck', value: 6 },
  { name: 'Rond de gîte', value: 4 },
  { name: 'Tende de tranche', value: 5 },
  { name: 'Plat de tranche', value: 4 },
  { name: 'Gîte à la noix', value: 3 },
  { name: 'Araignée', value: 2 },
  { name: 'Bavette d\'aloyau', value: 4 },
  { name: 'Onglet', value: 3 },
  { name: 'Hampe', value: 3 },
  { name: 'Bavette de flanchet', value: 2 },
  { name: 'Plat de côtes', value: 2 },
  { name: 'Tendron / Milieu de poitrine', value: 2 },
  { name: 'Gros bout de poitrine', value: 1 },
  { name: 'Macreuse à pot-au-feu', value: 2 },
  { name: 'Jumeau à pot-au-feu', value: 2 },
  { name: 'Paleron', value: 3 },
  { name: 'Macreuse à bifteck', value: 3 },
  { name: 'Jumeau à bifteck', value: 3 },
  { name: 'Aiguillette baronne', value: 4 },
  { name: 'Gîte', value: 2 },
];

export const SvgBeefCuts: Story = {
  name: 'SVG geo (beef cuts)',
  render: (args) => <RegisteredBeefMap {...args} />,
  args: {
    width: 760,
    height: 480,
    option: {
      title: {
        text: 'Beef cuts',
        subtext: 'SVG registered as a map — hover the regions',
        left: 'center',
      },
      tooltip: { trigger: 'item' },
      visualMap: {
        left: 'center',
        bottom: 12,
        min: 0,
        max: 8,
        orient: 'horizontal',
        text: ['Premium', 'Stew'],
        calculable: true,
        inRange: { color: ['#fff3e0', '#ffb74d', '#fb8c00', '#bf360c'] },
      },
      series: [
        {
          name: 'Cut',
          type: 'map',
          map: 'beef',
          roam: true,
          emphasis: {
            label: { show: false },
            itemStyle: { areaColor: '#ffeb3b' },
          },
          selectedMode: 'single',
          select: { itemStyle: { areaColor: '#fdd835' } },
          data: beefCuts,
        },
      ],
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'Same `series.type: "map"` as the world choropleth — only difference is what was registered. `echarts.registerMap("beef", { svg })` registers an inline SVG; each `<path>` named in the SVG becomes a hoverable, color-mappable region. Use this for floor plans, body anatomy, factory layouts, sports fields, or any other diagram.',
      },
    },
  },
};
