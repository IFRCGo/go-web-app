import { PagerProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Args,
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Pager from './Pager';

type PagerSpecificProps = PagerProps

type Story = StoryObj<PagerSpecificProps>;

const meta: Meta<typeof Pager> = {
    title: 'Components/Pager',
    component: Pager,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/myeW85ibN5p2SlnXcEpxFD/IFRC-GO---UI-Current---1?type=design&node-id=0-4957&mode=design&t=KwxbuoUQxqcLyZbG-0',
        },
    },
    args: {
        onActivePageChange: fn(),
    },
    tags: ['autodocs'],
};

export default meta;

function Template(args:Args) {
    const [{ activePage, maxItemsPerPage }, handleArgsChange] = useArgs();

    const onChange = (e: number) => {
        handleArgsChange({ activePage: e });
    };
    return (
        <Pager
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...args}
            onActivePageChange={onChange}
            maxItemsPerPage={maxItemsPerPage}
            activePage={activePage}
            itemsCount={10}
        />
    );
}

export const Default: Story = {
    render: Template,
    args: {
        activePage: 3,
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
        activePage: 5,
        maxItemsPerPage: 1,
        showAllPages: true,
    },
};
