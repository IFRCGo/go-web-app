import {
    act,
    useContext,
    useEffect,
} from 'react';
import {
    createRoot,
    type Root,
} from 'react-dom/client';
import {
    afterEach,
    beforeEach,
    expect,
    test,
    vi,
} from 'vitest';

import supportedLayerNames from '#utils/nrw/layers';

import {
    type AdminAreaProperties,
    type AdminLevel,
    type NrwAdminAreaFeatureCollection,
    type NrwEvent,
    type NrwExposedAdminArea,
    type PlaceCode,
} from '../types';
import NrwAdminAreasContext, { type NrwAdminAreasContextProps } from './NrwAdminAreasContext';
import NrwAdminAreasProvider from '.';

// React only flushes updates inside act() when this flag is set.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// The requests are faked. The test reads the latest /admin-areas request and
// answers it, as the server would.
interface AdminAreasRequest {
    url: string;
    skip?: boolean;
    query?: { filter: string };
    onSuccess?: (adminAreas: NrwAdminAreaFeatureCollection) => void;
    onFailure?: () => void;
}

let adminAreasRequest: AdminAreasRequest | undefined;

vi.mock('#utils/restRequest', () => ({
    useNrwRequest: (request: AdminAreasRequest) => {
        if (request.url === '/admin-areas') {
            adminAreasRequest = request;
        }
        return { response: undefined, pending: false, error: undefined };
    },
}));

function requestedFilter() {
    if (!adminAreasRequest || adminAreasRequest.skip) {
        return undefined;
    }
    return adminAreasRequest.query?.filter;
}

function createArea(placeCode: string, name: string): NrwExposedAdminArea {
    return {
        placeCode,
        name,
        adminLevel: placeCode.length - 2,
        exposure: [{ layerName: supportedLayerNames.exposedPopulation, total: null, exposed: 1 }],
    };
}

// Two states, each with counties, one of which has payams.
const event = {
    eventId: 8,
    countryCodeIso3: 'SSD',
    exposedAdminAreas: {
        0: [createArea('SS', 'South Sudan')],
        1: [createArea('SS03', 'Jonglei'), createArea('SS04', 'Lakes')],
        2: [createArea('SS0303', 'Bor South'), createArea('SS0401', 'Awerial')],
        3: [createArea('SS030301', 'Bor')],
    },
} as unknown as NrwEvent;

const jonglei: AdminAreaProperties = {
    adminLevel: 1 as AdminLevel,
    placeCode: 'SS03' as PlaceCode,
    name: 'Jonglei',
};
const borSouth: AdminAreaProperties = {
    adminLevel: 2 as AdminLevel,
    placeCode: 'SS0303' as PlaceCode,
    name: 'Bor South',
};

// One state with two counties, so the drill starts at the counties.
const eventSplitAtCounties = {
    ...event,
    eventId: 9,
    exposedAdminAreas: {
        0: [createArea('SS', 'South Sudan')],
        1: [createArea('SS03', 'Jonglei')],
        2: [createArea('SS0303', 'Bor South'), createArea('SS0304', 'Twic East')],
        3: [createArea('SS030301', 'Bor')],
    },
} as unknown as NrwEvent;

const someAdminAreas = {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: null, properties: {} }],
} as unknown as NrwAdminAreaFeatureCollection;
const noAdminAreas = {
    type: 'FeatureCollection',
    features: [],
} as unknown as NrwAdminAreaFeatureCollection;

let root: Root | undefined;
let container: HTMLDivElement | undefined;
let latest: NrwAdminAreasContextProps | undefined;

function Probe() {
    const value = useContext(NrwAdminAreasContext);

    useEffect(() => {
        latest = value;
    });

    return null;
}

function adminAreas() {
    if (!latest) {
        throw new Error('NrwAdminAreasProvider has not rendered');
    }
    return latest;
}

async function render(renderedEvent: NrwEvent | undefined) {
    if (!root) {
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
    }
    await act(async () => {
        root?.render(
            <NrwAdminAreasProvider event={renderedEvent}>
                <Probe />
            </NrwAdminAreasProvider>,
        );
    });
}

async function drillDown(adminArea: AdminAreaProperties) {
    await act(async () => {
        adminAreas().drillDown(adminArea);
    });
}

async function drillUp() {
    await act(async () => {
        adminAreas().drillUp();
    });
}

async function drillUpTo(adminLevel: number) {
    await act(async () => {
        adminAreas().drillUpTo(adminLevel as AdminLevel);
    });
}

async function answer(response: NrwAdminAreaFeatureCollection | undefined) {
    await act(async () => {
        if (response) {
            adminAreasRequest?.onSuccess?.(response);
        } else {
            adminAreasRequest?.onFailure?.();
        }
    });
}

beforeEach(async () => {
    await render(event);
});

afterEach(async () => {
    await act(async () => {
        root?.unmount();
    });
    container?.remove();
    root = undefined;
    container = undefined;
    latest = undefined;
    adminAreasRequest = undefined;
});

test('opens at the first level with several exposed areas', () => {
    expect(adminAreas().initialAdminLevel).toBe(1);
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().drillPath).toEqual([]);
    expect(adminAreas().parentAdminArea).toBeUndefined();
    expect(adminAreas().adminAreas).toBeUndefined();
    expect(adminAreas().canDrillDown(jonglei.placeCode)).toBe(true);
    expect(requestedFilter()).toBe("(countryCodeIso3='SSD') AND adminLevel=1 AND placeCode IN ('SS03','SS04')");
});

test('shows the next level only once its admin areas have loaded', async () => {
    await answer(someAdminAreas);
    await drillDown(jonglei);
    expect(requestedFilter()).toBe(
        "(countryCodeIso3='SSD') AND adminLevel=2 AND placeCodeLevel1='SS03' AND placeCode IN ('SS0303','SS0401')",
    );
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().drillPath).toEqual([]);
    expect(adminAreas().parentAdminArea).toBeUndefined();

    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(2);
    expect(adminAreas().drillPath).toEqual([jonglei]);
    expect(adminAreas().parentAdminArea).toEqual(jonglei);
    expect(adminAreas().adminAreas).toBe(someAdminAreas);

    await drillUp();
    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
    expect(adminAreas().adminLevel).toBe(2);

    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().parentAdminArea).toBeUndefined();
});

test('stays on the shown level when the requested admin areas do not load', async () => {
    await drillDown(jonglei);
    await answer(undefined);

    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().canDrillDown(jonglei.placeCode)).toBe(true);
});

test('remembers an admin area without children as the finest level', async () => {
    await answer(someAdminAreas);
    await drillDown(jonglei);
    await answer(noAdminAreas);

    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().adminAreas).toBe(someAdminAreas);
    expect(adminAreas().canDrillDown(jonglei.placeCode)).toBe(false);
    expect(adminAreas().canDrillDown('SS04' as PlaceCode)).toBe(true);

    // Not requested again.
    await drillDown(jonglei);
    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
});

test('drills down only into exposed admin levels', async () => {
    await drillDown(jonglei);
    await answer(someAdminAreas);
    await drillDown(borSouth);
    await answer(someAdminAreas);

    expect(adminAreas().adminLevel).toBe(3);
    expect(adminAreas().canDrillDown('SS030301' as PlaceCode)).toBe(false);
});

test('does not drill up from the top', async () => {
    const shown = adminAreas();

    await drillUp();

    expect(adminAreas()).toBe(shown);
    expect(adminAreas().adminLevel).toBe(1);
    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
});

test('jumps back to a level drilled through', async () => {
    await drillDown(jonglei);
    await answer(someAdminAreas);
    await drillDown(borSouth);
    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(3);
    expect(adminAreas().drillPath).toEqual([jonglei, borSouth]);

    await drillUpTo(1);
    expect(requestedFilter()).toBe("(countryCodeIso3='SSD') AND adminLevel=1 AND placeCode IN ('SS03','SS04')");
    expect(adminAreas().adminLevel).toBe(3);
    expect(adminAreas().drillPath).toEqual([jonglei, borSouth]);

    await answer(someAdminAreas);
    expect(adminAreas().initialAdminLevel).toBe(1);
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().drillPath).toEqual([]);
    expect(adminAreas().parentAdminArea).toBeUndefined();

    await drillDown(jonglei);
    await answer(someAdminAreas);
    await drillDown(borSouth);
    await answer(someAdminAreas);

    await drillUpTo(2);
    expect(requestedFilter()).toBe(
        "(countryCodeIso3='SSD') AND adminLevel=2 AND placeCodeLevel1='SS03' AND placeCode IN ('SS0303','SS0401')",
    );

    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(2);
    expect(adminAreas().drillPath).toEqual([jonglei]);
    expect(adminAreas().parentAdminArea).toEqual(jonglei);
});

test('jumps back to the first exposed level of the event', async () => {
    await render(eventSplitAtCounties);
    expect(adminAreas().initialAdminLevel).toBe(2);
    expect(requestedFilter()).toBe("(countryCodeIso3='SSD') AND adminLevel=2 AND placeCode IN ('SS0303','SS0304')");
    await answer(someAdminAreas);

    await drillDown(borSouth);
    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(3);
    expect(adminAreas().drillPath).toEqual([borSouth]);

    await drillUpTo(2);
    expect(requestedFilter()).toBe("(countryCodeIso3='SSD') AND adminLevel=2 AND placeCode IN ('SS0303','SS0304')");

    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(2);
    expect(adminAreas().drillPath).toEqual([]);
});

test('starts over at the top for another event, or the same one again', async () => {
    await drillDown(jonglei);
    await answer(someAdminAreas);
    expect(adminAreas().adminLevel).toBe(2);

    await render(undefined);
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().adminAreas).toBeUndefined();
    expect(requestedFilter()).toBeUndefined();

    await render(event);
    expect(adminAreas().adminLevel).toBe(1);
    expect(adminAreas().parentAdminArea).toBeUndefined();
    expect(adminAreas().adminAreas).toBeUndefined();
    expect(requestedFilter()).toContain('adminLevel=1 AND placeCode IN');
});
