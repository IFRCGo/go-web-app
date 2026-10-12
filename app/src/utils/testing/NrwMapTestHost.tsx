import {
    type ReactNode,
    useMemo,
} from 'react';

import NrwMapContext from '#components/domain/NrwMap/NrwMapContext';

import { type FakeNrwMap } from './nrwAdminAreaTesting';

// Mirrors NrwMapContainer, which provides the map only after its style has loaded.
function NrwMapTestHost(props: {
    map: FakeNrwMap['map'];
    children: ReactNode;
}) {
    const { map, children } = props;

    const mapContext = useMemo(() => ({ map }), [map]);

    return (
        <NrwMapContext.Provider value={mapContext}>
            {children}
        </NrwMapContext.Provider>
    );
}

export default NrwMapTestHost;
