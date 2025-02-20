import { useTranslation } from '@ifrc-go/ui/hooks';
import { type LngLatBoundsLike } from 'mapbox-gl';

import RiskImminentEvents from '#components/domain/RiskImminentEvents';

import i18n from './i18n.json';
import styles from './styles.module.css';

const defaultBounds: LngLatBoundsLike = [-160, -60, 190, 80];

/** @knipignore */
// eslint-disable-next-line import/prefer-default-export
export function Component() {
    const strings = useTranslation(i18n);

    return (
        <div className={styles.riskWatchImminent}>
            <RiskImminentEvents
                variant="global"
                title={strings.imminentEventsSidebarHeading}
                bbox={defaultBounds}
            />
        </div>
    );
}

Component.displayName = 'RiskWatchImminent';
