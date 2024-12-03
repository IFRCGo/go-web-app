import {
    useCallback,
    useMemo,
    useState,
} from 'react';
import {
    CycloneIcon,
    DroughtIcon,
    EarthquakeIcon,
    FloodIcon,
    ForestFireIcon,
} from '@ifrc-go/icons';
import {
    Container,
    InfoPopup,
    Radio,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
import { _cs } from '@togglecorp/fujs';
import type { LngLatBoundsLike } from 'mapbox-gl';

import Link from '#components/Link';
import WikiLink from '#components/WikiLink';
import { environment } from '#config';
import { type components } from '#generated/riskTypes';
import { hazardTypeToColorMap } from '#utils/domain/risk';

import Gdacs from './Gdacs';
import MeteoSwiss from './MeteoSwiss';
import Pdc from './Pdc';
import WfpAdam from './WfpAdam';

import i18n from './i18n.json';
import styles from './styles.module.css';

export type ImminentEventSource = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss';
type HazardType = components<'read'>['schemas']['HazardTypeEnum'];

type BaseProps = {
    className?: string;
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    defaultSource?: ImminentEventSource;
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
    const {
        className,
        defaultSource = 'gdacs',
        ...otherProps
    } = props;
    const [activeView, setActiveView] = useState<ImminentEventSource>(defaultSource);

    const strings = useTranslation(i18n);

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

    const handleRadioClick = useCallback((key: ImminentEventSource) => {
        setActiveView(key);
    }, []);

    const riskHazards: Array<{
        key: HazardType,
        label: string,
        icon: React.ReactNode,
    }> = useMemo(
        () => [
            {
                key: 'FL',
                label: strings.imminentEventsFlood,
                icon: <FloodIcon className={styles.icon} />,
            },
            {
                key: 'TC',
                label: strings.imminentEventsStorm,
                icon: <CycloneIcon className={styles.icon} />,
            },
            {
                key: 'EQ',
                label: strings.imminentEventsEarthquake,
                icon: <EarthquakeIcon className={styles.icon} />,
            },
            {
                key: 'DR',
                label: strings.imminentEventsDrought,
                icon: <DroughtIcon className={styles.icon} />,
            },
            {
                key: 'WF',
                label: strings.imminentEventsWildfire,
                icon: <ForestFireIcon className={styles.icon} />,
            },
        ],
        [
            strings.imminentEventsFlood,
            strings.imminentEventsStorm,
            strings.imminentEventsEarthquake,
            strings.imminentEventsDrought,
            strings.imminentEventsWildfire,
        ],
    );

    return (
        <Container
            className={_cs(styles.riskImminentEvents, className)}
            heading={strings.imminentEventsHeading}
            headerDescription={strings.imminentEventsDescription}
            withHeaderBorder
            actions={(
                <WikiLink
                    href="user_guide/risk_module#imminent-events"
                />
            )}
            footerContent={(
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
            footerActionsContainerClassName={styles.footerActions}
            footerActions={(
                <>
                    <Radio
                        name="gdacs"
                        value={activeView === 'gdacs'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourceGdacsLabel}
                        actions={(
                            <InfoPopup
                                title={strings.gdacsTitle}
                                popupClassName={styles.popup}
                                descriptionClassName={styles.description}
                                description={resolveToComponent(
                                    strings.gdacsDescription,
                                    {
                                        here: (
                                            <Link
                                                href="https://www.gdacs.org/default.aspx"
                                                variant="tertiary"
                                                external
                                            >
                                                {strings.here}
                                            </Link>
                                        ),
                                    },
                                )}
                            />
                        )}
                    />
                    <Radio
                        name="pdc"
                        value={activeView === 'pdc'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourcePdcLabel}
                        actions={(
                            <InfoPopup
                                title={strings.pdcTooltipTitle}
                                popupClassName={styles.popup}
                                descriptionClassName={styles.description}
                                description={resolveToComponent(
                                    strings.pdcTooltipDescription,
                                    {
                                        here: (
                                            <Link
                                                href="https://www.pdc.org/wp-content/uploads/AIM-3-Fact-Sheet-Screen-1.pdf"
                                                variant="tertiary"
                                                external
                                            >
                                                {strings.here}
                                            </Link>
                                        ),
                                    },
                                )}
                            />
                        )}
                    />
                    {environment !== 'production' && (
                        <Radio
                            name="wfpAdam"
                            value={activeView === 'wfpAdam'}
                            onClick={handleRadioClick}
                            label={strings.imminentEventsSourceWfpAdamLabel}
                            actions={(
                                <InfoPopup
                                    title={strings.wfpAdamTitle}
                                    popupClassName={styles.popup}
                                    descriptionClassName={styles.description}
                                    description={resolveToComponent(
                                        strings.wfpAdamDescription,
                                        {
                                            here: (
                                                <Link
                                                    href="https://gis.wfp.org/adam/"
                                                    variant="tertiary"
                                                    external
                                                >
                                                    {strings.here}
                                                </Link>
                                            ),
                                        },
                                    )}
                                />
                            )}
                        />
                    )}
                    {environment !== 'production' && (
                        <Radio
                            name="meteoSwiss"
                            value={activeView === 'meteoSwiss'}
                            onClick={handleRadioClick}
                            label={strings.imminentEventsSourceMeteoSwissLabel}
                            actions={(
                                <InfoPopup
                                    title={strings.meteoSwissTitle}
                                    popupClassName={styles.popup}
                                    descriptionClassName={styles.description}
                                    description={(
                                        <div className={styles.descriptionContent}>
                                            <div>
                                                {strings.meteoSwissDescriptionOne}
                                            </div>
                                            <div>
                                                {resolveToComponent(
                                                    strings.meteoSwissDescriptionTwo,
                                                    {
                                                        here: (
                                                            <Link
                                                                href="https://www.meteoswiss.admin.ch/about-us/research-and-cooperation/projects/2021/weather4un.html"
                                                                variant="tertiary"
                                                                external
                                                            >
                                                                {strings.here}
                                                            </Link>
                                                        ),
                                                    },
                                                )}
                                            </div>
                                        </div>
                                    )}
                                />
                            )}
                        />
                    )}
                </>
            )}
            headingLevel={2}
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
