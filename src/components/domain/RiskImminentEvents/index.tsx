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
import { hazardTypeToColorMap } from '#utils/domain/risk';
import { type components } from '#generated/riskTypes';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';

import Pdc from './Pdc';
import WfpAdam from './WfpAdam';
import Gdacs from './Gdacs';
import MeteoSwiss from './MeteoSwiss';
import i18n from './i18n.json';
import styles from './styles.module.css';

type ActiveView = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss';
type ViewOption = { key: ActiveView, label: string };
function viewKeySelector(option: ViewOption) {
    return option.key;
}

type HazardType = components<'read'>['schemas']['HazardTypeEnum'];
const riskHazards: Array<{
    key: HazardType,
    label: string,
    icon: React.ReactNode,
}> = [
    // FIXME: use translation
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
    bbox: LngLatBoundsLike | undefined;
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

    const strings = useTranslation(i18n);

    const viewOptions = useMemo<Array<ViewOption>>(
        () => [
            { key: 'pdc', label: strings.imminentEventsSourcePdcLabel },
            { key: 'wfpAdam', label: strings.imminentEventsSourceWfpAdamLabel },
            { key: 'gdacs', label: strings.imminentEventsSourceGdacsLabel },
            { key: 'meteoSwiss', label: strings.imminentEventsSourceMeteoSwissLabel },
        ],
        [strings],
    );

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
        <Container
            className={_cs(styles.riskImminentEvents, className)}
            heading={strings.imminentEventsHeading}
            headerDescription={strings.imminentEventsDescription}
            withHeaderBorder
            footerIcons={(
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
            )}
            footerActions={(
                <RadioInput
                    name={undefined}
                    value={activeView}
                    options={viewOptions}
                    onChange={setActiveView}
                    labelSelector={stringLabelSelector}
                    keySelector={viewKeySelector}
                />
            )}
        >
            {CurrentView && (
                <CurrentView
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
        </Container>
    );
}

export default RiskImminentEvents;
