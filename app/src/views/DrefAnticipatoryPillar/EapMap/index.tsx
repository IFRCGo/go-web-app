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

import CountryPointsMap, { type CountryPoint } from '#components/domain/CountryPointsMap';
import useAuth from '#hooks/domain/useAuth';
import {
    COLOR_BLUE,
    EAP_STATUS_APPROVED,
} from '#utils/constants';
import { useRequest } from '#utils/restRequest';

import i18n from './i18n.json';

const MAP_LIMIT = 1000;

// Only approved EAPs are mapped: there is no "active/activated" EAP status, so per the
// design annotation we show approved only (and render no legend).
function EapMap() {
    const strings = useTranslation(i18n);
    // Public page, private endpoint: without the skip an empty map reads as
    // "no approved EAPs".
    const { isAuthenticated } = useAuth();

    const {
        pending,
        error,
        response,
    } = useRequest({
        skip: !isAuthenticated,
        url: '/api/v2/eap-registration/',
        preserveResponse: true,
        query: {
            status: EAP_STATUS_APPROVED,
            limit: MAP_LIMIT,
        },
    });

    const eapsByIso3 = useMemo(
        () => listToGroupList(
            (response?.results ?? []).filter((eap) => isDefined(eap.country_details?.iso3)),
            (eap) => eap.country_details?.iso3 as string,
        ),
        [response],
    );

    const points = useMemo<CountryPoint[]>(
        () => Object.keys(eapsByIso3).map((iso3) => ({ iso3, color: COLOR_BLUE })),
        [eapsByIso3],
    );

    const renderPopup = useCallback(
        (iso3: string) => {
            const eaps = eapsByIso3[iso3] ?? [];
            return (
                <ListView layout="block" spacing="sm" withSpacingOpticalCorrection>
                    {eaps.map((eap) => (
                        <Container
                            key={eap.id}
                            heading={eap.country_details?.name}
                            headingLevel={6}
                            spacing="xs"
                        >
                            <TextOutput
                                label={strings.eapMapType}
                                value={eap.eap_type_display}
                                textSize="sm"
                            />
                        </Container>
                    ))}
                </ListView>
            );
        },
        [eapsByIso3, strings.eapMapType],
    );

    return (
        <Container
            heading={strings.eapMapTitle}
            withHeaderBorder
            // NOTE: overlayPending keeps the map mounted across refetches.
            pending={pending}
            overlayPending
            errored={isDefined(error)}
            empty={!isAuthenticated}
            emptyMessage={strings.eapMapLoginRequired}
        >
            <CountryPointsMap
                mapTitle={strings.eapMapTitle}
                points={points}
                renderPopup={renderPopup}
            />
        </Container>
    );
}

export default EapMap;
