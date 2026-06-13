import { useCallback } from 'react';
import { PaginationProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Pagination from './Pagination';

type Story = StoryObj<PaginationProps>;

const meta = {
    title: 'Inputs/Pagination',
    component: Pagination,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11491-193026&t=JxlW0bNF2vjvkZ01-4',
        },
    },
    args: {
        onActivePageChange: fn(),
    },
    tags: ['autodocs'],
} satisfies Meta<typeof Pagination>;

export default meta;

function Template(args:Args) {
    const [{
        activePage,
        maxItemsPerPage,
        onActivePageChange,
    }, handleArgsChange] = useArgs();

    const onChange = useCallback((currentPage: number) => {
        handleArgsChange({ activePage: currentPage });
        onActivePageChange(currentPage);
    }, [handleArgsChange, onActivePageChange]);

    return (
        <Pagination
            itemsCount={10}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onActivePageChange={onChange}
            maxItemsPerPage={maxItemsPerPage}
            activePage={activePage}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        itemsCount: 10,
        activePage: 1,
        maxItemsPerPage: 1,
    },
};

export const Disabled: Story = {
    render: Template,
    args: {
        activePage: 5,
        maxItemsPerPage: 1,
        disabled: true,
    },
};

export const ShowAllPages: Story = {
    render: Template,
    args: {
        activePage: 2,
        maxItemsPerPage: 1,
        showAllPages: true,
    },
};
