import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Breadcrumbs from './Breadcrumbs';

interface Datum {
    id: number;
    label: string;
}

const data: Datum[] = [
    { id: 1, label: 'Home' },
    { id: 2, label: 'Africa' },
    { id: 3, label: 'Benin' },
];

const keySelector = (datum: Datum) => datum.id;
const labelSelector = (datum: Datum) => datum.label;
const rendererParams = () => ({});

type Story = StoryObj<typeof Breadcrumbs>;

const meta: Meta<typeof Breadcrumbs> = {
    title: 'Components/Breadcrumbs',
    component: Breadcrumbs,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11368-192658&t=JxlW0bNF2vjvkZ01-4',
            allowFullscreen: true,
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        data,
        keySelector,
        labelSelector,
        rendererParams,
        renderer: ({ children }) => (
            <div>
                {children}
            </div>
        ),
    },
};

export const WithSlashSeparator: Story = {
    args: {
        ...Default.args,
        separator: '/',
    },
};
