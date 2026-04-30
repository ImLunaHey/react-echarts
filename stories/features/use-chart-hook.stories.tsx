import type { Meta, StoryObj } from '@storybook/react-vite';
import { useEffect, useRef } from 'react';

import { useChart } from '../../src';
import { SizedBox } from '../decorators';

const meta: Meta = {
  title: 'Features/useChart hook',
};

export default meta;
type Story = StoryObj;

const HookExample = () => {
  const ref = useRef<HTMLDivElement>(null);
  const chart = useChart(ref, {
    option: {
      xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
      yAxis: { type: 'value' },
      tooltip: { trigger: 'axis' },
      series: [{ type: 'line', data: [120, 132, 101, 134, 90], smooth: true }],
    },
  });

  useEffect(() => {
    const id = setInterval(() => {
      const i = Math.floor(Math.random() * 5);
      chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: i });
    }, 1500);
    return () => clearInterval(id);
  }, [chart]);

  return (
    <SizedBox>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
    </SizedBox>
  );
};

export const OwnContainer: Story = {
  render: () => <HookExample />,
};
