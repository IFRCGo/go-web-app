import { ImageProps } from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Image from './Image';

type ImageSpecificProps = ImageProps;

type Story = StoryObj<ImageSpecificProps>;

const meta: Meta<typeof Image> = {
    title: 'Components/Image',
    component: Image,
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
            const componentArgs = ctx.args as ImageSpecificProps;
            return (
                <Image
                // eslint-disable-next-line react/jsx-props-no-spreading
                    {...componentArgs}
                />
            );
        },
    ],
};

export default meta;

export const Default: Story = {
    args: {
        src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgbrM1jom-4qX5O5NM1tAcLa7ckXcBkao-KbaIFsQNVzLsNBNYewNPeJD_mC0N7FFzwHM&usqp=CAU',
    },
};

export const WithoutImage: Story = {
    args: {
        src: '',
    },
};
