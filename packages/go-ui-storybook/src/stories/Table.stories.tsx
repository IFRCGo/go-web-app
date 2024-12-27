import {
    Column,
    TableProps,
} from '@ifrc-go/ui';
import {
    createDateColumn,
    createElementColumn,
    createListDisplayColumn,
    createNumberColumn,
    createStringColumn,
} from '@ifrc-go/ui/utils';
import type {
    Meta,
    StoryObj,
} from '@storybook/react';

import Table from './Table';

interface Data {
    id: number;
    name: string;
    dateOfBirth: string;
    link: string;
    characteristics: string[];
    status: string;
    habitat: string;
    comments: string;
}

const data = [
    {
        id: 1,
        name: 'African Elephant',
        dateOfBirth: '2010-05-12',
        link: 'https://en.wikipedia.org/wiki/african_elephant',
        characteristics: [
            'Large',
            'Gray',
            'Tusks',
        ],
        status: 'Endangered',
        habitat: 'Savannah',
        comments: 'Largest land animal',
    },
    {
        id: 2,
        name: 'Bald Eagle',
        dateOfBirth: '2012-07-04',
        link: 'https://en.wikipedia.org/wiki/bald_eagle',
        characteristics: [
            'Large wingspan',
            'White head',
            'Sharp beak',
        ],
        status: 'Least Concern',
        habitat: 'Forests, mountains, and rivers',
        comments: 'National bird of the USA',
    },
    {
        id: 3,
        name: 'Cheetah',
        dateOfBirth: '2015-03-22',
        link: 'https://en.wikipedia.org/wiki/cheetah',
        characteristics: [
            'Fast',
            'Spotted',
            'Slim build',
        ],
        status: 'Vulnerable',
        habitat: 'Grasslands',
        comments: 'Fastest land animal',
    },
    {
        id: 4,
        name: 'Dolphin',
        dateOfBirth: '2013-09-18',
        link: 'https://en.wikipedia.org/wiki/dolphin',
        characteristics: [
            'Intelligent',
            'Social',
            'Echolocation',
        ],
        status: 'Least Concern',
        habitat: 'Oceans',
        comments: 'Known for their intelligence',
    },
    {
        id: 5,
        name: 'Emperor Penguin',
        dateOfBirth: '2011-12-01',
        link: 'https://en.wikipedia.org/wiki/emperor_penguin',
        characteristics: [
            'Large',
            'Black and white',
            'Flightless',
        ],
        status: 'Near Threatened',
        habitat: 'Antarctica',
        comments: 'Largest species of penguin',
    },
    {
        id: 6,
        name: 'Fennec Fox',
        dateOfBirth: '2016-01-10',
        link: 'https://en.wikipedia.org/wiki/fennec_fox',
        characteristics: [
            'Small',
            'Big ears',
            'Nocturnal',
        ],
        status: 'Least Concern',
        habitat: 'Deserts',
        comments: 'Smallest fox species',
    },
    {
        id: 7,
        name: 'Giant Panda',
        dateOfBirth: '2014-08-23',
        link: 'https://en.wikipedia.org/wiki/giant_panda',
        characteristics: [
            'Black and white',
            'Bamboo eater',
            'Calm',
        ],
        status: 'Vulnerable',
        habitat: 'Mountain forests',
        comments: 'Symbol of conservation',
    },
    {
        id: 8,
        name: 'Great White Shark',
        dateOfBirth: '2009-06-15',
        link: 'https://en.wikipedia.org/wiki/great_white_shark',
        characteristics: [
            'Large',
            'Apex predator',
            'Sharp teeth',
        ],
        status: 'Vulnerable',
        habitat: 'Coastal waters',
        comments: 'Known for their size and strength',
    },
    {
        id: 9,
        name: 'Hummingbird',
        dateOfBirth: '2018-04-05',
        link: 'https://en.wikipedia.org/wiki/hummingbird',
        characteristics: [
            'Small',
            'Colourful',
            'Fast wings',
        ],
        status: 'Least Concern',
        habitat: 'Gardens, forests',
        comments: 'Can hover in mid-air',
    },
    {
        id: 10,
        name: 'Indian Tiger',
        dateOfBirth: '2013-11-11',
        link: 'https://en.wikipedia.org/wiki/indian_tiger',
        characteristics: [
            'Striped',
            'Powerful',
            'Carnivorous',
        ],
        status: 'Endangered',
        habitat: 'Tropical forests',
        comments: 'Largest cat species in India',
    },
];
const keySelector = (d: Data) => d.id;
const columns = [
    createNumberColumn<Data, number>(
        'id',
        'ID',
        (item) => item.id,
        undefined,
    ),
    createStringColumn<Data, number>(
        'name',
        'Name',
        (item) => item.name,
    ),
    createDateColumn<Data, number>(
        'dateOfBirth',
        'Date of Birth',
        (item) => item.dateOfBirth,
    ),
    createElementColumn<Data, number, { link: string, title: string }>(
        'link',
        'Link',
        ({ link, title }) => (
            <a href={link}>{title}</a>
        ),
        (_, item) => ({ link: item.link, title: item.name }),
    ),
    createListDisplayColumn<Data, number, string, { character: string }>(
        'characteristics',
        'Characteristics',
        (item) => ({
            list: item.characteristics,
            renderer: ({ character }) => (
                <span>{character}</span>
            ),
            rendererParams: (character) => ({
                character,
            }),
            keySelector: (character) => character,
        }),
    ),
    createStringColumn<Data, number>(
        'status',
        'Status',
        (item) => item.status,
    ),
    createStringColumn<Data, number>(
        'habitat',
        'Habitat',
        (item) => item.habitat,
    ),
];

type Story = StoryObj<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    TableProps<Data, number, Column<Data, number, any, any>>
>;

const meta: Meta<typeof Table> = {
    title: 'Components/Table',
    component: Table,
    parameters: {
        layout: 'centered',
        design: {
            type: 'figma',
            url: 'https://www.figma.com/file/k9SOqgh5jk9PxzuBKdMKsA/IFRC-GO---UI-Library?node-id=11175-183597&t=JxlW0bNF2vjvkZ01-4',
        },
    },
    argTypes: {
        className: {
            type: 'string',
        },
        captionClassName: {
            type: 'string',
        },
        headerCellClassName: {
            type: 'string',
        },
        headerRowClassName: {
            type: 'string',
        },
        rowClassName: {
            type: 'string',
        },
        rowModifier: {
            type: 'function',
        },
    },
    tags: ['autodocs'],
};

export default meta;

export const Default: Story = {
    args: {
        data,
        columns,
        keySelector,
        caption: 'Animal Information Dataset',
        fixedColumnWidth: false,
        resizableColumn: false,
        filtered: false,
        pending: false,
        headersHidden: false,
    },
};

export const WithHeadersHidden: Story = {
    args: {
        data,
        columns,
        keySelector,
        caption: 'Animal Information Dataset',
        headersHidden: true,
    },
};

export const WithFixedColumnWidth: Story = {
    args: {
        data,
        columns,
        keySelector,
        caption: 'All columns utilize fixed width formatting.',
        fixedColumnWidth: true,
    },
};

export const WithResizableColumn: Story = {
    args: {
        data,
        columns,
        keySelector,
        caption: 'You can utilize the header column to adjust the width of each column.',
        resizableColumn: true,
    },
};
