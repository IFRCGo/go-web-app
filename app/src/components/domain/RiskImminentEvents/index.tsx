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
    LegendItem,
    ListView,
    Radio,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import { resolveToComponent } from '@ifrc-go/ui/utils';
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

export type ImminentEventSource = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss';
type HazardType = components<'read'>['schemas']['CommonHazardTypeEnumKey'];

interface SourceOption {
    key: ImminentEventSource;
    label: string;
    infoTitle: string;
    infoDescription: React.ReactNode;
}

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
                icon: <FloodIcon />,
            },
            {
                key: 'TC',
                label: strings.imminentEventsStorm,
                icon: <CycloneIcon />,
            },
            {
                key: 'EQ',
                label: strings.imminentEventsEarthquake,
                icon: <EarthquakeIcon />,
            },
            {
                key: 'DR',
                label: strings.imminentEventsDrought,
                icon: <DroughtIcon />,
            },
            {
                key: 'WF',
                label: strings.imminentEventsWildfire,
                icon: <ForestFireIcon />,
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

    const sourceOptions = useMemo<SourceOption[]>(
        () => {
            const options: SourceOption[] = [
                {
                    key: 'gdacs',
                    label: strings.imminentEventsSourceGdacsLabel,
                    infoTitle: strings.gdacsTitle,
                    infoDescription: resolveToComponent(
                        strings.gdacsDescription,
                        {
                            here: (
                                <Link
                                    href="https://www.gdacs.org/default.aspx"
                                    styleVariant="action"
                                    external
                                >
                                    {strings.here}
                                </Link>
                            ),
                        },
                    ),
                },
                {
                    key: 'pdc',
                    label: strings.imminentEventsSourcePdcLabel,
                    infoTitle: strings.pdcTooltipTitle,
                    infoDescription: resolveToComponent(
                        strings.pdcTooltipDescription,
                        {
                            here: (
                                <Link
                                    href="https://www.pdc.org/wp-content/uploads/AIM-3-Fact-Sheet-Screen-1.pdf"
                                    styleVariant="action"
                                    external
                                >
                                    {strings.here}
                                </Link>
                            ),
                        },
                    ),
                },
            ];

            if (environment !== 'production') {
                options.push(
                    {
                        key: 'wfpAdam',
                        label: strings.imminentEventsSourceWfpAdamLabel,
                        infoTitle: strings.wfpAdamTitle,
                        infoDescription: resolveToComponent(
                            strings.wfpAdamDescription,
                            {
                                here: (
                                    <Link
                                        href="https://gis.wfp.org/adam/"
                                        styleVariant="action"
                                        external
                                    >
                                        {strings.here}
                                    </Link>
                                ),
                            },
                        ),
                    },
                    {
                        key: 'meteoSwiss',
                        label: strings.imminentEventsSourceMeteoSwissLabel,
                        infoTitle: strings.meteoSwissTitle,
                        infoDescription: (
                            <ListView layout="block">
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
                                                    styleVariant="action"
                                                    external
                                                >
                                                    {strings.here}
                                                </Link>
                                            ),
                                        },
                                    )}
                                </div>
                            </ListView>
                        ),
                    },
                );
            }

            return options;
        },
        [strings],
    );

    return (
        <Container
            className={className}
            heading={strings.imminentEventsHeading}
            headerDescription={strings.imminentEventsDescription}
            withHeaderBorder
            headerActions={(
                <WikiLink
                    pathName="user_guide/risk_module#imminent-events"
                />
            )}
            footer={(
                <ListView
                    withWrap
                    withDarkBackground
                    withSpaceBetweenContents
                    withPadding
                >
                    <ListView
                        withWrap
                        spacing="sm"
                        withSpacingOpticalCorrection
                    >
                        {riskHazards.map((hazard) => (
                            <LegendItem
                                icon={hazard.icon}
                                label={hazard.label}
                                color={hazardTypeToColorMap[hazard.key]}
                                withColorInvertedIcon
                            />
                        ))}
                    </ListView>
                    <ListView
                        withWrap
                        spacing="sm"
                        withSpacingOpticalCorrection
                    >
                        {sourceOptions.map((option) => (
                            <Radio
                                key={option.key}
                                name={option.key}
                                value={activeView === option.key}
                                onClick={handleRadioClick}
                                after={(
                                    <InfoPopup
                                        title={option.infoTitle}
                                        description={option.infoDescription}
                                    />
                                )}
                            >
                                {option.label}
                            </Radio>
                        ))}
                    </ListView>
                </ListView>
            )}
        >
            {activeView === 'pdc' && (
                <Pdc
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
            {activeView === 'wfpAdam' && (
                <WfpAdam
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
            {activeView === 'gdacs' && (
                <Gdacs
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
            {activeView === 'meteoSwiss' && (
                <MeteoSwiss
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...otherProps}
                />
            )}
        </Container>
    );
}

export default RiskImminentEvents;
