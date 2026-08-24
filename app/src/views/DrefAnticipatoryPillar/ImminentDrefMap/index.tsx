import {
    useCallback,
    useMemo,
} from 'react';
import {
    Container,
    ListView,
    TextOutput,
} from '@ifrc-go/ui';
import { useTranslation } from '@ifrc-go/ui/hooks';
import {
    isDefined,
    listToGroupList,
} from '@togglecorp/fujs';

import CountryPointsMap, {
    type CountryPoint,
    type MapLegendOption,
} from '#components/domain/CountryPointsMap';
import DisasterTypeSelectInput from '#components/domain/DisasterTypeSelectInput';
import useAuth from '#hooks/domain/useAuth';
import useFilterState from '#hooks/useFilterState';
import {
    COLOR_BLUE,
    DREF_TYPE_IMMINENT,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

const MAP_LIMIT = 1000;

function ImminentDrefMap() {
    const strings = useTranslation(i18n);
    // Public page, private endpoint: without the skip an empty map reads as
    // "no imminent DREFs".
    const { isAuthenticated } = useAuth();

    const {
        filter,
        rawFilter,
        setFilterField,
    } = useFilterState<{
        disasterType?: number;
    }>({
        filter: {},
    });

    const {
        pending,
        error,
        response,
    } = useRequest({
        skip: !isAuthenticated,
        url: '/api/v2/active-dref/',
        preserveResponse: true,
        query: {
            type_of_dref: [DREF_TYPE_IMMINENT],
            disaster_type: filter.disasterType,
            limit: MAP_LIMIT,
        },
    });

    const drefsByIso3 = useMemo(
        () => listToGroupList(
            (response?.results ?? []).filter((dref) => isDefined(dref.country_details?.iso3)),
            (dref) => dref.country_details?.iso3 as string,
        ),
        [response],
    );

    const points = useMemo<CountryPoint[]>(
        () => Object.keys(drefsByIso3).map((iso3) => ({ iso3, color: COLOR_BLUE })),
        [drefsByIso3],
    );

    const legendOptions = useMemo<MapLegendOption[]>(
        () => [{ value: 'imminent', label: strings.imminentMapLegend, color: COLOR_BLUE }],
        [strings.imminentMapLegend],
    );

    const renderPopup = useCallback(
        (iso3: string) => {
            const drefs = drefsByIso3[iso3] ?? [];
            return (
                <ListView layout="block" spacing="sm" withSpacingOpticalCorrection>
                    {drefs.map((dref) => (
                        <Container
                            key={dref.id}
                            heading={dref.title}
                            headingLevel={6}
                            spacing="xs"
                        >
                            <TextOutput
                                label={strings.imminentMapStatus}
                                value={dref.status_display}
                                textSize="sm"
                            />
                        </Container>
                    ))}
                </ListView>
            );
        },
        [drefsByIso3, strings.imminentMapStatus],
    );

    return (
        <Container
            heading={strings.imminentMapTitle}
            withHeaderBorder
            // NOTE: overlayPending keeps the map mounted, otherwise every filter
            // change would tear down and re-initialise the map canvas.
            pending={pending}
            overlayPending
            errored={isDefined(error)}
            empty={!isAuthenticated}
            emptyMessage={strings.imminentMapLoginRequired}
            filters={isAuthenticated ? (
                <DisasterTypeSelectInput
                    placeholder={strings.imminentMapDisasterTypePlaceholder}
                    name="disasterType"
                    value={rawFilter.disasterType}
                    onChange={setFilterField}
                />
            ) : undefined}
        >
            <CountryPointsMap
                mapTitle={strings.imminentMapTitle}
                points={points}
                legendOptions={legendOptions}
                renderPopup={renderPopup}
            />
        </Container>
    );
}

export default ImminentDrefMap;
