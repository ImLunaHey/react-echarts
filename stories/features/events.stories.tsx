import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Features/Events',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const ClickToInspect = () => {
  const [last, setLast] = useState<string>('Click a bar');
  return (
    <div>
      <SizedBox>
        <Chart
          option={{
            xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
            yAxis: { type: 'value' },
            tooltip: { trigger: 'item' },
            series: [{ type: 'bar', data: [12, 18, 7, 22, 15] }],
          }}
          onEvents={{
            click: (params) => {
              const name = (params as { name?: string }).name ?? '?';
              const value = (params as { value?: number }).value ?? 0;
              setLast(`${name} = ${value}`);
            },
          }}
        />
      </SizedBox>
      <p style={{ fontFamily: 'monospace', marginTop: 8 }}>Last click: {last}</p>
    </div>
  );
};

const LegendToggle = () => {
  const [hidden, setHidden] = useState<string[]>([]);
  return (
    <div>
      <SizedBox>
        <Chart
          option={{
            legend: { data: ['Email', 'Direct', 'Search'] },
            xAxis: { type: 'category', data: ['M', 'T', 'W', 'T', 'F'] },
            yAxis: { type: 'value' },
            tooltip: { trigger: 'axis' },
            series: [
              { name: 'Email', type: 'line', data: [120, 132, 101, 134, 90] },
              { name: 'Direct', type: 'line', data: [220, 182, 191, 234, 290] },
              { name: 'Search', type: 'line', data: [150, 232, 201, 154, 190] },
            ],
          }}
          onEvents={{
            legendselectchanged: (params) => {
              const selected = (params as { selected: Record<string, boolean> }).selected;
              setHidden(Object.entries(selected).filter(([, on]) => !on).map(([n]) => n));
            },
          }}
        />
      </SizedBox>
      <p style={{ fontFamily: 'monospace', marginTop: 8 }}>
        Hidden: {hidden.length === 0 ? '(none)' : hidden.join(', ')}
      </p>
    </div>
  );
};

export const Click: Story = { render: () => <ClickToInspect /> };
export const Legend: Story = { render: () => <LegendToggle /> };
