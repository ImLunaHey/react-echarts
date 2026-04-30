import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  ControlledChart,
  controlledChartArgTypes,
  controlledChartDefaults,
} from '../controlled-chart';

const meta: Meta<typeof ControlledChart> = {
  title: 'Chart types/Tree',
  component: ControlledChart,
  argTypes: controlledChartArgTypes,
  args: { ...controlledChartDefaults, width: 720, height: 420 },
};

export default meta;
type Story = StoryObj<typeof ControlledChart>;

const data = {
  name: 'root',
  children: [
    {
      name: 'apps',
      children: [
        { name: 'web' },
        { name: 'admin' },
        { name: 'mobile', children: [{ name: 'ios' }, { name: 'android' }] },
      ],
    },
    {
      name: 'libs',
      children: [
        { name: 'ui' },
        { name: 'data' },
        { name: 'utils', children: [{ name: 'date' }, { name: 'string' }] },
      ],
    },
    {
      name: 'tools',
      children: [{ name: 'eslint' }, { name: 'tsdown' }],
    },
  ],
};

export const Horizontal: Story = {
  args: {
    option: {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'tree',
          data: [data],
          top: '5%',
          bottom: '5%',
          left: '12%',
          right: '12%',
          symbol: 'emptyCircle',
          symbolSize: 8,
          label: { position: 'left', verticalAlign: 'middle', align: 'right' },
          leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
          emphasis: { focus: 'descendant' },
          expandAndCollapse: true,
        },
      ],
    },
  },
};

export const Radial: Story = {
  args: {
    width: 520,
    height: 520,
    option: {
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'tree',
          data: [data],
          layout: 'radial',
          symbol: 'emptyCircle',
          symbolSize: 7,
          initialTreeDepth: 3,
          animationDurationUpdate: 750,
        },
      ],
    },
  },
};
