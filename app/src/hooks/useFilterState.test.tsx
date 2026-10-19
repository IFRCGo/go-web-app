import { useLayoutEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
    createMemoryRouter,
    RouterProvider,
} from 'react-router-dom';
import {
    afterEach,
    expect,
    test,
} from 'vitest';

import urlParam from '#utils/urlParam';

import useFilterState, { type UrlParams } from './useFilterState';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = false;

interface Filter {
    startDateAfter?: string;
    appealType?: number;
    disasterType?: number;
    position?: string;
}

const urlParams: UrlParams<Filter> = {
    appealType: urlParam.number('atype'),
    disasterType: urlParam.number('dtype'),
    position: urlParam.text('position'),
};

type Result = ReturnType<typeof useFilterState<Filter>>;

interface Commit {
    page: number;
    offset: number;
    filter: Filter;
    rawFilter: Filter;
}

const probe: {
    latest?: Result;
    commits: Commit[];
} = { commits: [] };

function useProbe(result: Result) {
    useLayoutEffect(() => {
        probe.latest = result;
        probe.commits.push({
            page: result.page,
            offset: result.offset,
            filter: result.filter,
            rawFilter: result.rawFilter,
        });
    });
}

function UrlFilterProbe() {
    const result = useFilterState<Filter>({
        filter: {},
        urlParams,
        debounceTime: 20,
    });
    useProbe(result);
    return (
        <input
            aria-label="position"
            value={result.rawFilter.position ?? ''}
            onChange={(event) => {
                result.setFilterField(event.target.value || undefined, 'position');
            }}
        />
    );
}

function LocalFilterProbe() {
    const result = useFilterState<Filter>({
        filter: {},
        debounceTime: 20,
    });
    useProbe(result);
    return null;
}

const sleep = (ms: number) => new Promise((resolve) => { setTimeout(resolve, ms); });

let cleanup: (() => void) | undefined;

function render(Probe: () => React.ReactNode, initialEntry: string) {
    probe.latest = undefined;
    probe.commits = [];
    const router = createMemoryRouter(
        [{ path: '/', element: <Probe /> }],
        { initialEntries: [initialEntry] },
    );
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    root.render(<RouterProvider router={router} />);
    cleanup = () => {
        root.unmount();
        container.remove();
    };
    return { router, container };
}

function getLatest() {
    if (!probe.latest) {
        throw new Error('probe did not render');
    }
    return probe.latest;
}

afterEach(() => {
    cleanup?.();
});

async function renderOnPage5(Probe: () => React.ReactNode, initialEntry: string) {
    const rendered = render(Probe, initialEntry);
    await sleep(50);
    getLatest().setPage(5);
    await sleep(50);
    expect(getLatest().offset).toBe(40);
    probe.commits = [];
    return rendered;
}

const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
function type(input: HTMLInputElement, value: string) {
    setInputValue?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
}

test('a URL filter change shows the first page at once and never requests the old offset', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?keep=1');

    getLatest().setFilterField(1, 'appealType');
    expect(probe.commits[0]?.rawFilter.appealType).toBe(1);
    expect(probe.commits[0]?.page).toBe(1);

    await sleep(80);
    expect(getLatest().filter.appealType).toBe(1);
    expect(getLatest().offset).toBe(0);
    expect(probe.commits
        .filter((commit) => commit.filter.appealType === 1)
        .every((commit) => commit.offset === 0)).toBe(true);
    expect(router.state.location.search).toBe('?keep=1&atype=1');
});

test('picking a URL filter again does not bring back the page picked under it', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?atype=1');

    getLatest().setFilterField(2, 'appealType');
    await sleep(50);
    getLatest().setFilterField(1, 'appealType');
    await sleep(80);

    expect(getLatest().page).toBe(1);
    expect(getLatest().offset).toBe(0);
    expect(router.state.location.search).toBe('?atype=1');
});

test('a URL change from outside the hook returns to the first page', async () => {
    const { router } = render(UrlFilterProbe, '/?atype=1');
    await router.navigate('/?atype=2');
    await sleep(50);
    getLatest().setPage(5);
    await sleep(50);

    await router.navigate(-1);
    await sleep(80);

    expect(getLatest().page).toBe(1);
    expect(getLatest().offset).toBe(0);
    expect(getLatest().filter.appealType).toBe(1);
});

test('URL fields set in one handler are all written', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?keep=1');

    const { setFilterField } = getLatest();
    setFilterField(1, 'appealType');
    setFilterField(2, 'disasterType');
    await sleep(80);

    expect(router.state.location.search).toBe('?keep=1&atype=1&dtype=2');
    expect(getLatest().filter).toEqual({ appealType: 1, disasterType: 2, position: undefined });
});

test('a text input bound to a URL field keeps fast keystrokes and spaces', async () => {
    const { router, container } = render(UrlFilterProbe, '/');
    await sleep(50);
    const input = container.querySelector('input');
    if (!input) {
        throw new Error('input did not render');
    }

    type(input, 'a');
    expect(input.value).toBe('a');
    type(input, `${input.value}b`);
    type(input, `${input.value} `);
    type(input, `${input.value}c`);
    await sleep(80);

    expect(input.value).toBe('ab c');
    expect(router.state.location.search).toBe('?position=ab+c');
});

test('a local filter change returns to the first page and keeps the URL filters', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?atype=1');

    getLatest().setFilterField('2026-01-01', 'startDateAfter');
    await sleep(80);

    expect(getLatest().page).toBe(1);
    expect(getLatest().offset).toBe(0);
    expect(getLatest().filter).toEqual({
        startDateAfter: '2026-01-01',
        appealType: 1,
        disasterType: undefined,
        position: undefined,
    });
    expect(router.state.location.search).toBe('?atype=1');
});

test('a search param the list does not declare keeps the page', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?atype=1');

    await router.navigate('/?atype=1&tab=2');
    await sleep(80);

    expect(getLatest().page).toBe(5);
    expect(getLatest().offset).toBe(40);
});

test('resetFilter clears the declared params and keeps the others', async () => {
    const { router } = await renderOnPage5(UrlFilterProbe, '/?keep=1&atype=1');
    getLatest().setFilterField('2026-01-01', 'startDateAfter');
    await sleep(50);

    getLatest().resetFilter();
    await sleep(80);

    expect(router.state.location.search).toBe('?keep=1');
    expect(getLatest().filtered).toBe(false);
    expect(getLatest().page).toBe(1);
});

test('without urlParams the URL is ignored and the setters keep their identity', async () => {
    const { router } = await renderOnPage5(LocalFilterProbe, '/?atype=3');
    const { setFilter, setFilterField, resetFilter } = getLatest();

    await router.navigate('/?atype=4');
    await sleep(50);
    expect(getLatest().page).toBe(5);
    expect(getLatest().setFilter).toBe(setFilter);
    expect(getLatest().setFilterField).toBe(setFilterField);
    expect(getLatest().resetFilter).toBe(resetFilter);

    getLatest().setFilterField('2026-01-01', 'startDateAfter');
    await sleep(80);
    expect(getLatest().page).toBe(1);
    expect(getLatest().filter).toEqual({ startDateAfter: '2026-01-01' });
    expect(router.state.location.search).toBe('?atype=4');
});
