import type { LngLatBoundsLike } from 'mapbox-gl';

import Arc from './Arc';
import Jba from './Jba';
import LayersProvider from './LayersProvider';
import { type MalawiRiskWatchSource } from './utils';

interface Props {
    source: MalawiRiskWatchSource;
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
}

function MalawiRiskWatch(props: Props) {
    const {
        source,
        title,
        bbox,
    } = props;

    return (
        // Keyed so layer choices reset when the source changes
        <LayersProvider key={source}>
            {source === 'jba' ? (
                <Jba
                    title={title}
                    bbox={bbox}
                />
            ) : (
                <Arc
                    title={title}
                    bbox={bbox}
                />
            )}
        </LayersProvider>
    );
}

export default MalawiRiskWatch;
