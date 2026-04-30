import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useMemo, useState } from 'react';

import { Chart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta = {
  title: 'Features/Dynamic option',
};

export default meta;
type Story = StoryObj;

const LiveData = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const option = useMemo(() => {
    const data = Array.from({ length: 30 }, (_, i) => Math.sin((i + tick) / 3) * 50 + 50);
    return {
      animation: false,
      xAxis: { type: 'category', data: data.map((_, i) => i) },
      yAxis: { type: 'value', min: 0, max: 100 },
      tooltip: { trigger: 'axis' },
      series: [{ type: 'line', data, smooth: true, areaStyle: {} }],
    };
  }, [tick]);

  return (
    <SizedBox>
      <Chart option={option} />
    </SizedBox>
  );
};

export const Streaming: Story = {
  render: () => <LiveData />,
};
