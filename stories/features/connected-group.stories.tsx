import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect } from 'react';

import { Chart, connect } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta = {
  title: 'Features/Connected group',
};

export default meta;
type Story = StoryObj;

const ConnectedPair = () => {
  useEffect(() => {
    connect('demo-group');
  }, []);

  const x = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <SizedBox height={220}>
        <Chart
          group="demo-group"
          option={{
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: x },
            yAxis: { type: 'value' },
            series: [{ type: 'line', data: [120, 132, 101, 134, 90, 230, 210] }],
          }}
        />
      </SizedBox>
      <SizedBox height={220}>
        <Chart
          group="demo-group"
          option={{
            tooltip: { trigger: 'axis' },
            xAxis: { type: 'category', data: x },
            yAxis: { type: 'value' },
            series: [{ type: 'bar', data: [320, 332, 301, 334, 390, 330, 320] }],
          }}
        />
      </SizedBox>
    </div>
  );
};

export const SyncedTooltip: Story = {
  render: () => <ConnectedPair />,
};
