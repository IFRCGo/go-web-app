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
    argTypes: {},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

function AllVariant() {
    return (
        <ListView layout="block">
            <Container heading="Primary">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Transparent
                    </Button>
                </ListView>
            </Container>
            <Container heading="Secondary">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                    >
                        Transparent
                    </Button>
                </ListView>
            </Container>
            <Container heading="Success">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="success"
                        textSize="md"
                        onClick={fn()}
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="success"
                        textSize="md"
                        onClick={fn()}
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="success"
                        textSize="md"
                        onClick={fn()}
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="success"
                        textSize="md"
                        onClick={fn()}
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="success"
                        textSize="md"
                        onClick={fn()}
                    >
                        Transparent
                    </Button>
                </ListView>
            </Container>
            <Container heading="Danger">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="danger"
                        textSize="md"
                        onClick={fn()}
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="danger"
                        textSize="md"
                        onClick={fn()}
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="danger"
                        textSize="md"
                        onClick={fn()}
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="danger"
                        textSize="md"
                        onClick={fn()}
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="danger"
                        textSize="md"
                        onClick={fn()}
                    >
                        Transparent
                    </Button>
                </ListView>
            </Container>
            <Container heading="Text">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="text"
                        textSize="md"
                        onClick={fn()}
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="text"
                        textSize="md"
                        onClick={fn()}
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="text"
                        textSize="md"
                        onClick={fn()}
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="text"
                        textSize="md"
                        onClick={fn()}
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="text"
                        textSize="md"
                        onClick={fn()}
                    >
                        Transparent
                    </Button>
                </ListView>
            </Container>
            <Container heading="Disabled">
                <ListView>
                    <Button
                        name="filled"
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Filled
                    </Button>
                    <Button
                        name="outline"
                        styleVariant="outline"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Outline
                    </Button>
                    <Button
                        name="action"
                        styleVariant="action"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Action
                    </Button>
                    <Button
                        name="translucent"
                        styleVariant="translucent"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        disabled
                    >
                        Translucent
                    </Button>
                    <Button
                        name="transparent"
                        styleVariant="transparent"
                        colorVariant="primary"
                        textSize="md"
                        disabled
                        onClick={fn()}
                    >
                        Transparent
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
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="xs"
                    >
                        Extra Small
                    </Button>
                    <Button
                        name="small"
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="sm"
                    >
                        Small
                    </Button>
                    <Button
                        name="medium"
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="md"
                    >
                        Medium
                    </Button>
                    <Button
                        name="large"
                        styleVariant="filled"
                        colorVariant="primary"
                        textSize="md"
                        onClick={fn()}
                        spacing="lg"
                    >
                        Large
                    </Button>
                    <Button
                        name="small"
                        styleVariant="filled"
                        colorVariant="primary"
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
                        styleVariant="filled"
                        colorVariant="secondary"
                        textSize="sm"
                        onClick={fn()}
                        spacing="sm"
                    >
                        Text Small
                    </Button>
                    <Button
                        name="medium"
                        styleVariant="filled"
                        colorVariant="secondary"
                        textSize="md"
                        onClick={fn()}
                        spacing="md"
                    >
                        Text Medium
                    </Button>
                    <Button
                        name="large"
                        styleVariant="filled"
                        colorVariant="secondary"
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
