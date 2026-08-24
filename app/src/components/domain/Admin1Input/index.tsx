import {
    useCallback,
    useMemo,
} from 'react';
import { CloseLineIcon } from '@ifrc-go/icons';
import {
    Button,
    Container,
    IconButton,
    InlineLayout,
    ListView,
    Modal,
    TextArea,
} from '@ifrc-go/ui';
import {
    useBooleanState,
    useTranslation,
} from '@ifrc-go/ui/hooks';
import {
    compareString,
    isDefined,
    isNotDefined,
    isTruthyString,
    listToMap,
    randomString,
} from '@togglecorp/fujs';
import {
    MapBounds,
    MapLayer,
} from '@togglecorp/re-map';
import {
    type ArrayError,
    getErrorObject,
} from '@togglecorp/toggle-form';
import {
    type FillLayer,
    type LineLayer,
    type MapboxGeoJSONFeature,
    type SymbolLayer,
} from 'mapbox-gl';

import GoMapContainer from '#components/GoMapContainer';
import NonFieldError from '#components/NonFieldError';
import useCountry from '#hooks/domain/useCountry';
import {
    COLOR_BLACK,
    COLOR_DARK_GREY,
    COLOR_LIGHT_GREY,
    COLOR_PRIMARY_RED,
    COLOR_TEXT,
    DEFAULT_MAP_PADDING,
    DURATION_MAP_ZOOM,
    MAX_PAGE_LIMIT,
} from '#utils/constants';
import { getGeoJsonBounds } from '#utils/geo';
import { useRequest } from '#utils/restRequest';

import BaseMap from '../BaseMap';

import i18n from './i18n.json';
import styles from './styles.module.css';

interface EapDistrictFormValue {
    client_id: string;
    id?: number;
    district?: number;
    description?: string;
    district_details?: { name?: string | null };
}

interface Props<NAME> {
    name: NAME;
    value: EapDistrictFormValue[] | null | undefined;
    onChange: (
        newValue: EapDistrictFormValue[] | undefined,
        name: NAME,
    ) => void;
    countryId: number;
    error: ArrayError<EapDistrictFormValue> | undefined;
    maxWords?: number;
    disabled?: boolean;
    readOnly?: boolean;
}

function Admin1Input<const NAME>(props: Props<NAME>) {
    const {
        name,
        value,
        onChange,
        countryId,
        error,
        maxWords,
        disabled,
        readOnly,
    } = props;

    const strings = useTranslation(i18n);

    const countryDetails = useCountry({ id: countryId });
    const iso3 = countryDetails?.iso3;

    const [
        showModal,
        {
            setTrue: setShowModalTrue,
            setFalse: setShowModalFalse,
        },
    ] = useBooleanState(false);

    const { response: districtResponse } = useRequest({
        skip: isNotDefined(countryId),
        url: '/api/v2/district/',
        query: {
            country: countryId,
            limit: MAX_PAGE_LIMIT,
        },
    });

    const districtNameMap = useMemo(
        () => {
            const detailsFromValue = value
                ?.map(({ district, district_details: details }) => (
                    isDefined(district) && isTruthyString(details?.name)
                        ? { id: district, name: details.name }
                        : undefined
                ))
                .filter(isDefined) ?? [];

            return listToMap(
                [...(districtResponse?.results ?? []), ...detailsFromValue],
                ({ id }) => id,
                ({ name: districtName }) => districtName,
            );
        },
        [districtResponse, value],
    );

    const selectedIds = useMemo(
        () => value?.map(({ district }) => district).filter(isDefined) ?? [],
        [value],
    );

    const sortedValue = useMemo(
        () => value
            ?.filter((item) => isDefined(item.district))
            .toSorted((foo, bar) => compareString(
                districtNameMap[foo.district as number],
                districtNameMap[bar.district as number],
            )),
        [value, districtNameMap],
    );

    const bounds = useMemo(
        () => (countryDetails ? getGeoJsonBounds(countryDetails.bbox) : undefined),
        [countryDetails],
    );

    const adminOneFillLayerOptions = useMemo<Omit<FillLayer, 'id'> | undefined>(
        () => {
            if (!iso3) {
                return undefined;
            }

            const defaultColor: NonNullable<FillLayer['paint']>['fill-color'] = [
                'case',
                ['boolean', ['feature-state', 'hovered'], false],
                COLOR_DARK_GREY,
                COLOR_LIGHT_GREY,
            ];

            return {
                type: 'fill',
                filter: ['==', ['get', 'country_iso3'], iso3.toUpperCase()],
                paint: {
                    'fill-color': selectedIds.length <= 0
                        ? defaultColor
                        : [
                            'match',
                            ['get', 'district_id'],
                            ...selectedIds.flatMap((districtId) => [
                                districtId,
                                COLOR_PRIMARY_RED,
                            ]),
                            defaultColor,
                        ],
                    'fill-outline-color': COLOR_DARK_GREY,
                    'fill-opacity': 1,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [iso3, selectedIds],
    );

    const adminOneLineLayerOptions = useMemo<Omit<LineLayer, 'id'> | undefined>(
        () => {
            if (!iso3) {
                return undefined;
            }

            return {
                type: 'line',
                filter: ['==', ['get', 'country_iso3'], iso3.toUpperCase()],
                paint: {
                    'line-color': COLOR_BLACK,
                    'line-opacity': 1,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [iso3],
    );

    const adminOneLabelLayerOptions = useMemo<Omit<SymbolLayer, 'id'> | undefined>(
        () => {
            if (!iso3) {
                return undefined;
            }

            return {
                type: 'symbol',
                filter: ['==', ['get', 'country_iso3'], iso3.toUpperCase()],
                paint: {
                    'text-color': COLOR_TEXT,
                    'text-opacity': 1,
                },
                layout: {
                    visibility: 'visible',
                },
            };
        },
        [iso3],
    );

    const handleAdmin1Click = useCallback(
        (clickedFeature: MapboxGeoJSONFeature) => {
            const properties = clickedFeature?.properties as {
                district_id?: number;
            };

            const districtId = properties?.district_id;

            if (isNotDefined(districtId)) {
                return false;
            }

            const index = value?.findIndex(
                (item) => item.district === districtId,
            ) ?? -1;

            if (index !== -1) {
                onChange(value?.toSpliced(index, 1), name);
                return false;
            }

            onChange(
                [
                    ...(value ?? []),
                    {
                        client_id: randomString(),
                        district: districtId,
                    },
                ],
                name,
            );

            return false;
        },
        [value, onChange, name],
    );

    const handleDescriptionChange = useCallback(
        (newDescription: string | undefined, clientId: string) => {
            onChange(
                value?.map((item) => (
                    item.client_id === clientId
                        ? { ...item, description: newDescription }
                        : item
                )),
                name,
            );
        },
        [value, onChange, name],
    );

    const removeSelection = useCallback(
        (clientId: string) => {
            onChange(
                value?.filter((item) => item.client_id !== clientId),
                name,
            );
        },
        [value, onChange, name],
    );

    return (
        <ListView
            className={styles.admin1Input}
            layout="block"
        >
            <NonFieldError error={getErrorObject(error)} />
            <Container
                heading={strings.heading}
                headingLevel={6}
                footer={!readOnly && (
                    <Button
                        name={undefined}
                        onClick={setShowModalTrue}
                        disabled={disabled}
                    >
                        {strings.buttonLabel}
                    </Button>
                )}
                withCompactMessage
                empty={isNotDefined(sortedValue) || sortedValue.length === 0}
                emptyMessage={strings.emptyMessage}
                withBorder
                withPadding
            >
                <ListView layout="block">
                    {sortedValue?.map((item) => {
                        const itemError = getErrorObject(error?.[item.client_id]);
                        return (
                            <InlineLayout
                                key={item.client_id}
                                after={!readOnly && (
                                    <IconButton
                                        name={item.client_id}
                                        onClick={removeSelection}
                                        title={strings.removeAreaButtonLabel}
                                        ariaLabel={strings.removeAreaButtonLabel}
                                        disabled={disabled}
                                    >
                                        <CloseLineIcon />
                                    </IconButton>
                                )}
                            >
                                <TextArea
                                    name={item.client_id}
                                    labelClassName={styles.districtLabel}
                                    label={
                                        districtNameMap[item.district as number]
                                        ?? String(item.district)
                                    }
                                    value={item.description}
                                    error={itemError?.description}
                                    onChange={handleDescriptionChange}
                                    maxWords={maxWords}
                                    disabled={disabled}
                                    readOnly={readOnly}
                                />
                            </InlineLayout>
                        );
                    })}
                </ListView>
            </Container>
            {showModal && (
                <Modal
                    onClose={setShowModalFalse}
                    heading={strings.modalHeading}
                    size="xl"
                    footerActions={(
                        <Button
                            name={undefined}
                            onClick={setShowModalFalse}
                        >
                            {strings.doneButtonLabel}
                        </Button>
                    )}
                >
                    <BaseMap
                        baseLayers={(
                            <>
                                {adminOneFillLayerOptions && (
                                    <MapLayer
                                        layerKey="admin-1-highlight"
                                        layerOptions={adminOneFillLayerOptions}
                                        onClick={handleAdmin1Click}
                                        hoverable
                                    />
                                )}
                                {adminOneLineLayerOptions && (
                                    <MapLayer
                                        layerKey="admin-1-boundary"
                                        layerOptions={adminOneLineLayerOptions}
                                    />
                                )}
                                {adminOneLabelLayerOptions && (
                                    <MapLayer
                                        layerKey="admin-1-label"
                                        layerOptions={adminOneLabelLayerOptions}
                                    />
                                )}
                            </>
                        )}
                    >
                        <GoMapContainer
                            title={strings.mapTitle}
                            withoutDownloadButton
                            withFullHeight
                        />
                        {bounds && (
                            <MapBounds
                                duration={DURATION_MAP_ZOOM}
                                padding={DEFAULT_MAP_PADDING}
                                bounds={bounds}
                            />
                        )}
                    </BaseMap>
                </Modal>
            )}
        </ListView>
    );
}

export default Admin1Input;
