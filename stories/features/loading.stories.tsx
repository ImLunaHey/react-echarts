import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useState } from 'react';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta<typeof Chart> = {
  title: 'Features/Loading',
  component: Chart,
};

export default meta;
type Story = StoryObj<typeof Chart>;

const SimulatedFetch = () => {
  const [loading, setLoading] = useState(true);
  const [option, setOption] = useState<Record<string, unknown>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      setOption({
        xAxis: { type: 'category', data: ['A', 'B', 'C', 'D', 'E'] },
        yAxis: { type: 'value' },
        tooltip: { trigger: 'axis' },
        series: [{ type: 'bar', data: [120, 200, 150, 80, 70] }],
      });
      setLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <SizedBox>
      <Chart option={option} loading={loading} />
    </SizedBox>
  );
};

export const SimulatedDataFetch: Story = {
  render: () => <SimulatedFetch />,
};
