import {
    Container,
    ListView,
} from '@ifrc-go/ui';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';
import { fn } from '@storybook/test';

import Button from './Button';

const meta = {
    title: 'Action/Button',
    component: Button,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/proto/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189642&t=T89pqHCZaIRUE5DW-1&scaling=contain&page-id=11126%3A176956&starting-point-node-id=11282%3A188000&mode=design',
            allowFullscreen: true,
        },
    },
    args: {
        name: 'button',
        onClick: fn(),
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            options: ['primary', 'secondary', 'tertiary', 'subtle'],
            control: { type: 'select' },
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

function AllVariant() {
    return (
        <ListView layout="block">
            <Container heading="Variants">
                <ListView>
                    <Button
                        name="primary"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Primary
                    </Button>
                    <Button
                        name="secondary"
                        variant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Secondary
                    </Button>
                    <Button
                        name="tertiary"
                        variant="tertiary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Tertiary
                    </Button>
                    <Button
                        name="subtle"
                        variant="subtle"
                        textSize="md"
                        onClick={fn()}
                    >
                        Subtle
                    </Button>
                </ListView>
            </Container>
            <Container heading="Disabled">
                <ListView>
                    <Button
                        name="primary"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Primary
                    </Button>
                    <Button
                        name="secondary"
                        variant="secondary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Secondary
                    </Button>
                    <Button
                        name="tertiary"
                        variant="tertiary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Tertiary
                    </Button>
                    <Button
                        name="subtle"
                        variant="subtle"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Subtle
                    </Button>
                </ListView>
            </Container>
        </ListView>
    );
}

function AllSpacing() {
    return (
        <ListView layout="block">
            <Container heading="Spacing">
                <ListView>
                    <Button
                        name="small"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="xs"
                    >
                        Extra Small
                    </Button>
                    <Button
                        name="small"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="sm"
                    >
                        Small
                    </Button>
                    <Button
                        name="medium"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="md"
                    >
                        Medium
                    </Button>
                    <Button
                        name="large"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="lg"
                    >
                        Large
                    </Button>
                    <Button
                        name="small"
                        variant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="xl"
                    >
                        Extra Large
                    </Button>
                </ListView>
            </Container>
            <Container heading="Text Size">
                <ListView>
                    <Button
                        name="small"
                        variant="secondary"
                        textSize="sm"
                        onClick={fn()}
                        spacing="sm"
                    >
                        Text Small
                    </Button>
                    <Button
                        name="medium"
                        variant="secondary"
                        textSize="md"
                        onClick={fn()}
                        spacing="md"
                    >
                        Text Medium
                    </Button>
                    <Button
                        name="large"
                        variant="secondary"
                        textSize="lg"
                        onClick={fn()}
                        spacing="lg"
                    >
                        Text Large
                    </Button>
                </ListView>
            </Container>

        </ListView>
    );
}

export const Default: Story = {
    args: {
        name: 'default',
        children: 'Default Button',

    },
    parameters: {
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?type=design&node-id=11261-189962&mode=design&t=H77btqXhNDop8ZRl-4',
            allowFullscreen: false,
        },
    },
};

export const Variants: Story = {
    render: AllVariant,
};

export const Spacing: Story = {
    render: AllSpacing,
};
