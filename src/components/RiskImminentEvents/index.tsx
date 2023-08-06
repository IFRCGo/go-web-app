import { useMemo, useState } from 'react';
import type { LngLatBoundsLike } from 'mapbox-gl';
import { _cs } from '@togglecorp/fujs';
import {
    CycloneIcon,
    DroughtIcon,
    EarthquakeIcon,
    FloodIcon,
} from '@ifrc-go/icons';

import RadioInput from '#components/RadioInput';
import { stringLabelSelector } from '#utils/selectors';
import { hazardTypeToColorMap } from '#utils/risk';
import type { components } from '#generated/riskTypes';

import Pdc from './Pdc';
import WfpAdam from './WfpAdam';
import Gdacs from './Gdacs';
import MeteoSwiss from './MeteoSwiss';
import styles from './styles.module.css';

type ActiveView = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss';
type ViewOption = { key: ActiveView, label: string };
const viewOptions: Array<ViewOption> = [
    { key: 'pdc', label: 'PDC' },
    { key: 'wfpAdam', label: 'WFP ADAM' },
    { key: 'gdacs', label: 'GDACS' },
    { key: 'meteoSwiss', label: 'MeteoSwiss' },
];
function viewKeySelector(option: ViewOption) {
    return option.key;
}

type HazardType = components['schemas']['HazardTypeEnum'];
const riskHazards: Array<{
    key: HazardType,
    label: string,
    icon: React.ReactNode,
}> = [
    {
        key: 'FL',
        label: 'Flood',
        icon: <FloodIcon className={styles.icon} />,
    },
    {
        key: 'TC',
        label: 'Storm',
        icon: <CycloneIcon className={styles.icon} />,
    },
    {
        key: 'EQ',
        label: 'Earthquake',
        icon: <EarthquakeIcon className={styles.icon} />,
    },
    {
        key: 'DR',
        label: 'Drought',
        icon: <DroughtIcon className={styles.icon} />,
    },
    {
        key: 'WF',
        label: 'Wildfire',
        icon: null,
    },
];

type BaseProps = {
    className?: string;
    title: React.ReactNode;
    bbox: LngLatBoundsLike;
}

type Props = BaseProps & ({
    variant: 'global';
} | {
    variant: 'region';
    regionId: number;
} | {
    variant: 'country';
    iso3: string;
})

function RiskImminentEvents(props: Props) {
    const [activeView, setActiveView] = useState<ActiveView>('pdc');
    const { className, ...otherProps } = props;

    const CurrentView = useMemo(
        () => {
            if (activeView === 'pdc') {
                return Pdc;
            }

            if (activeView === 'wfpAdam') {
                return WfpAdam;
            }

            if (activeView === 'gdacs') {
                return Gdacs;
            }

            if (activeView === 'meteoSwiss') {
                return MeteoSwiss;
            }

            return null;
        },
        [activeView],
    );

    return (
        <div className={_cs(styles.riskImminentEvents, className)}>
            {CurrentView && (
                <CurrentView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
            <div className={styles.footer}>
                <div className={styles.legend}>
                    {riskHazards.map((hazard) => (
                        <div
                            key={hazard.key}
                            className={styles.legendItem}
                        >
                            <div
                                className={styles.iconContainer}
                                style={{
                                    backgroundColor: hazardTypeToColorMap[hazard.key],
                                }}
                            >
                                {hazard.icon}
                            </div>
                            <div className={styles.label}>
                                {hazard.label}
                            </div>
                        </div>
                    ))}
                </div>
                <RadioInput
                    name={undefined}
                    value={activeView}
                    options={viewOptions}
                    onChange={setActiveView}
                    labelSelector={stringLabelSelector}
                    keySelector={viewKeySelector}
                />
            </div>
        </div>
    );
}

export default RiskImminentEvents;
