import {
    useCallback,
    useEffect,
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

import ActiveCountryBaseMapLayer from '../ActiveCountryBaseMapLayer';
import { type HdxLayerSelection } from '../RiskImminentEventMap/hdxLayers';
import {
    DEFAULT_LOCAL_UNITS_OPACITY,
    type LocalUnitsSelection,
} from '../RiskImminentEventMap/useLocalUnits';
import { JBA_DEFAULT_LEAD_TIME_DAYS } from './malawi/constants';
import Arc from './Arc';
import Gdacs from './Gdacs';
import Jba from './Jba';
import MeteoSwiss from './MeteoSwiss';
import Pdc from './Pdc';
import WfpAdam from './WfpAdam';

import i18n from './i18n.json';

export type ImminentEventSource = 'pdc' | 'wfpAdam' | 'gdacs' | 'meteoSwiss' | 'jba' | 'arc';

const MALAWI_ISO3 = 'MWI';
type HazardType = components<'read'>['schemas']['CommonHazardTypeEnumKey'];

type BaseProps = {
    className?: string;
    title: React.ReactNode;
    bbox: LngLatBoundsLike | undefined;
    defaultSource?: ImminentEventSource;
    baseLayers?: React.ReactNode;
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
        ...otherProps
    } = props;

    const additionalProps: Props = {
        ...props,
        // eslint-disable-next-line react/destructuring-assignment
        baseLayers: props.variant === 'country'
            // eslint-disable-next-line react/destructuring-assignment
            ? <ActiveCountryBaseMapLayer activeCountryIso3={props.iso3} />
            : undefined,
    };

    const isMalawi = (
        // eslint-disable-next-line react/destructuring-assignment
        props.variant === 'country' && props.iso3 === MALAWI_ISO3
    );
    // eslint-disable-next-line react/destructuring-assignment
    const defaultSource: ImminentEventSource = props.defaultSource
        ?? (isMalawi ? 'jba' : 'gdacs');

    const [activeView, setActiveView] = useState<ImminentEventSource>(defaultSource);

    // HDX layer selection is lifted here so it persists across JBA <-> ARC.
    // Multiple layers may be active at once, each with its own representation
    // (choropleth/bubble) and opacity.
    const [activeHdxLayers, setActiveHdxLayers] = useState<HdxLayerSelection[]>([]);
    const [localUnits, setLocalUnits] = useState<LocalUnitsSelection>({
        active: false,
        opacity: DEFAULT_LOCAL_UNITS_OPACITY,
    });
    const [activeLeadTimeDays, setActiveLeadTimeDays] = useState<number>(
        JBA_DEFAULT_LEAD_TIME_DAYS,
    );

    // Reset layer selection when switching to a non-Malawi source.
    useEffect(() => {
        if (activeView !== 'jba' && activeView !== 'arc') {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveHdxLayers([]);
            setLocalUnits({ active: false, opacity: DEFAULT_LOCAL_UNITS_OPACITY });
        }
    }, [activeView]);

    const strings = useTranslation(i18n);

    const handleRadioClick = useCallback((key: ImminentEventSource) => {
        setActiveView(key);
    }, []);

    const showLayerSelection = isMalawi;

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
                                key={hazard.key}
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
                        <Radio
                            name="gdacs"
                            value={activeView === 'gdacs'}
                            onClick={handleRadioClick}
                            after={(
                                <InfoPopup
                                    title={strings.gdacsTitle}
                                    description={resolveToComponent(
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
                                    )}
                                />
                            )}
                        >
                            {strings.imminentEventsSourceGdacsLabel}
                        </Radio>
                        <Radio
                            name="pdc"
                            value={activeView === 'pdc'}
                            onClick={handleRadioClick}
                            after={(
                                <InfoPopup
                                    title={strings.pdcTooltipTitle}
                                    description={resolveToComponent(
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
                                    )}
                                />
                            )}
                        >
                            {strings.imminentEventsSourcePdcLabel}
                        </Radio>
                        {environment !== 'production' && (
                            <Radio
                                name="wfpAdam"
                                value={activeView === 'wfpAdam'}
                                onClick={handleRadioClick}
                                after={(
                                    <InfoPopup
                                        title={strings.wfpAdamTitle}
                                        description={resolveToComponent(
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
                                        )}
                                    />
                                )}
                            >
                                {strings.imminentEventsSourceWfpAdamLabel}
                            </Radio>
                        )}
                        {environment !== 'production' && (
                            <Radio
                                name="meteoSwiss"
                                value={activeView === 'meteoSwiss'}
                                onClick={handleRadioClick}
                                after={(
                                    <InfoPopup
                                        title={strings.meteoSwissTitle}
                                        description={(
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
                                        )}
                                    />
                                )}
                            >
                                {strings.imminentEventsSourceMeteoSwissLabel}
                            </Radio>
                        )}
                        {isMalawi && (
                            <Radio
                                name="jba"
                                value={activeView === 'jba'}
                                onClick={handleRadioClick}
                            >
                                {/* FIXME: use strings */}
                                JBA
                            </Radio>
                        )}
                        {isMalawi && (
                            <Radio
                                name="arc"
                                value={activeView === 'arc'}
                                onClick={handleRadioClick}
                            >
                                {/* FIXME: use strings */}
                                ARC
                            </Radio>
                        )}
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
                    {...additionalProps}
                />
            )}
            {activeView === 'gdacs' && (
                <Gdacs
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...additionalProps}
                />
            )}
            {activeView === 'meteoSwiss' && (
                <MeteoSwiss
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...additionalProps}
                />
            )}
            {activeView === 'jba' && (
                <Jba
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...additionalProps}
                    showLayerSelection={showLayerSelection}
                    activeHdxLayers={activeHdxLayers}
                    onActiveHdxLayersChange={setActiveHdxLayers}
                    localUnits={localUnits}
                    onLocalUnitsChange={setLocalUnits}
                    activeLeadTimeDays={activeLeadTimeDays}
                    onActiveLeadTimeDaysChange={setActiveLeadTimeDays}
                />
            )}
            {activeView === 'arc' && (
                <Arc
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...additionalProps}
                    showLayerSelection={showLayerSelection}
                    activeHdxLayers={activeHdxLayers}
                    onActiveHdxLayersChange={setActiveHdxLayers}
                    localUnits={localUnits}
                    onLocalUnitsChange={setLocalUnits}
                />
            )}
        </Container>
    );
}

export default RiskImminentEvents;
