import { useMemo, useState, useCallback } from 'react';
import type { LngLatBoundsLike } from 'mapbox-gl';
import { _cs } from '@togglecorp/fujs';

import Container from '#components/Container';
import InfoPopup from '#components/InfoPopup';
import Link from '#components/Link';
import Radio from '#components/RadioInput/Radio';
import WikiLink from '#components/WikiLink';
import useTranslation from '#hooks/useTranslation';
import { resolveToComponent } from '#utils/translation';

import Pdc from './Pdc';
import WfpAdam from './WfpAdam';
import Gdacs from './Gdacs';
import MeteoSwiss from './MeteoSwiss';
import i18n from './i18n.json';
import styles from './styles.module.css';

type ActiveView = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss';

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

    const handleRadioClick = useCallback((key: ActiveView) => {
        setActiveView(key);
    }, []);

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
            footerActionsContainerClassName={styles.footerActions}
            footerActions={(
                <>
                    <Radio
                        name="pdc"
                        value={activeView === 'pdc'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourcePdcLabel}
                    />
                    <InfoPopup
                        className={styles.popup}
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
                    <Radio
                        name="wfpAdam"
                        value={activeView === 'wfpAdam'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourceWfpAdamLabel}
                    />
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
                    <Radio
                        name="gdacs"
                        value={activeView === 'gdacs'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourceGdacsLabel}
                    />
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
                    <Radio
                        name="meteoSwiss"
                        value={activeView === 'meteoSwiss'}
                        onClick={handleRadioClick}
                        label={strings.imminentEventsSourceMeteoSwissLabel}
                    />
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
                </>
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
