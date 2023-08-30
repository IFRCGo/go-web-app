import {
    _cs,
    isDefined,
} from '@togglecorp/fujs';
import type { FillLayer } from 'mapbox-gl';
import Map, {
    MapBounds,
    MapSource,
    MapLayer,
} from '@togglecorp/re-map';
import getBbox from '@turf/bbox';

import MapContainerWithDisclaimer from '#components/MapContainerWithDisclaimer';
import Container from '#components/Container';
import useTranslation from '#hooks/useTranslation';
import type { GoApiResponse } from '#utils/restRequest';
import {
    defaultMapStyle,
    defaultMapOptions,
    defaultNavControlPosition,
    defaultNavControlOptions,
} from '#utils/map';
import useCountryRaw, { type Country } from '#hooks/domain/useCountryRaw';
import { COLOR_LIGHT_GREY, COLOR_LIGHT_RED } from '#utils/constants';

import i18n from './i18n.json';
import styles from './styles.module.css';

type EventItem = GoApiResponse<'/api/v2/event/{id}'>;

function getBoundingBox(countryList: Country[]) {
    if (countryList.length < 1) {
        return undefined;
    }

    const collection = {
        type: 'FeatureCollection' as const,
        features: countryList.map((country) => ({
            type: 'Feature' as const,
            geometry: country.bbox,
        })),
    };

    return getBbox(collection);
}

interface Props {
    event: EventItem;
    className?: string;
}

function EmergencyMap(props: Props) {
    const {
        className,
        event,
    } = props;

    const strings = useTranslation(i18n);
    const countries = useCountryRaw();
    const countryIdList = event.countries.map((country) => country.id);
    const countryList = countryIdList.map(
        (id) => countries?.find((country) => country.id === id),
    ).filter(isDefined);

    const bounds = getBoundingBox(countryList);

    const districtIdList = event.districts.map((district) => district.id);

    const adminOneHightlightLayerOptions: Omit<FillLayer, 'id'> = {
        type: 'fill',
        layout: {
            visibility: 'visible',
        },
        filter: [
            'in',
            'district_id',
            ...districtIdList,
        ],
    };

    const adminOneLabelSelectedLayerOptions: Omit<FillLayer, 'id'> = {
        type: 'fill',
        layout: {
            visibility: 'visible',
        },
        filter: [
            'in',
            'district_id',
            ...districtIdList,
        ],
    };

    const adminZeroHighlightLayerOptions: Omit<FillLayer, 'id'> = {
        type: 'fill',
        layout: {
            visibility: 'visible',
        },
        filter: [
            '!in',
            'country_id',
            ...countryIdList,
        ],
    };

    const legendOptions = [
        {
            label: strings.affectedCountry,
            color: COLOR_LIGHT_GREY,
        },
        {
            label: strings.affectedProvince,
            color: COLOR_LIGHT_RED,
        },
    ];

    return (
        <Container
            className={_cs(styles.emergencyMap, className)}
            withHeaderBorder
        >
            <Map
                mapStyle={defaultMapStyle}
                mapOptions={defaultMapOptions}
                navControlShown
                navControlPosition={defaultNavControlPosition}
                navControlOptions={defaultNavControlOptions}
                scaleControlShown={false}
            >
                <MapContainerWithDisclaimer className={styles.mapContainer} />
                <MapSource
                    sourceKey="composite"
                    managed={false}
                >
                    <MapLayer
                        layerKey="admin-0-highlight"
                        layerOptions={adminZeroHighlightLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-1-highlight"
                        hoverable
                        layerOptions={adminOneHightlightLayerOptions}
                    />
                    <MapLayer
                        layerKey="admin-1-label-selected"
                        layerOptions={adminOneLabelSelectedLayerOptions}
                    />
                </MapSource>
                {isDefined(bounds) && (
                    <MapBounds
                        duration={1000}
                        bounds={bounds}
                        padding={50}
                    />
                )}
            </Map>
            <div className={styles.footer}>
                {legendOptions.map((legendItem) => (
                    <div
                        key={legendItem.label}
                        className={styles.legendItem}
                    >
                        <div
                            className={styles.color}
                            style={{ backgroundColor: legendItem.color }}
                        />
                        <div className={styles.label}>
                            {legendItem.label}
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
}

export default EmergencyMap;
