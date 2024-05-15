import { PagerProps } from '@ifrc-go/ui';
import { useArgs } from '@storybook/preview-api';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Pager from './Pager';

type PagerSpecificProps = PagerProps & {
    onChange: (e: number) => void;
};

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
    tags: ['autodocs'],
    decorators: [
        function Component(_, ctx) {
            const componentArgs = ctx.args as PagerSpecificProps;
            const [{ activePage, maxItemsPerPage }, handleArgsChange] = useArgs();

            const setActivePage = (e: number) => {
                handleArgsChange({ activePage: e });
            };

            return (
                <Pager
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                    onActivePageChange={setActivePage}
                    maxItemsPerPage={maxItemsPerPage}
                    activePage={activePage}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        activePage: 3,
        itemsCount: 10,
        maxItemsPerPage: 1,
    },
};

export const Disabled: Story = {
    args: {
        activePage: 5,
        itemsCount: 10,
        maxItemsPerPage: 1,
        disabled: true,
    },
};

export const ShowAllPages: Story = {
    args: {
        activePage: 5,
        itemsCount: 10,
        maxItemsPerPage: 1,
        showAllPages: true,
    },
};
